// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// NOTE: `topics` must be defined as a global const BEFORE this script loads.

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
const LOW_RES_SCALE = 0.4;
const DEVICE_PIXEL_RATIO = Math.max(window.devicePixelRatio || 1, 1);
let currentPdfUrl = '';
let loadGeneration = 0;
let currentTopicIndex = -1;

// === PDF Document LRU Cache (keeps N parsed documents warm) ===
const MAX_PDF_DOCS = 15;
const pdfCache = {};        // url -> pdfDoc
const pdfCacheOrder = [];   // LRU order, most-recently-used at the end
const pdfLoadPromises = {}; // url -> in-flight Promise<pdfDoc>, de-dupes concurrent loads

function pdfCacheTouch(url) {
    const idx = pdfCacheOrder.indexOf(url);
    if (idx !== -1) pdfCacheOrder.splice(idx, 1);
    pdfCacheOrder.push(url);
}

function pdfCacheSet(url, doc) {
    pdfCache[url] = doc;
    pdfCacheTouch(url);
    // NOTE: we deliberately do NOT call doc.destroy() on eviction here.
    // Prefetches (hover, neighbor-warming) can still have an in-flight
    // getPage()/render() against an "evicted" document; destroying it
    // mid-operation kills the PDF.js worker for that doc and surfaces
    // as an unhandled rejection ("Script error." / broken next load).
    // Just drop our reference and let it be garbage-collected once
    // nothing else is using it — simpler and race-free.
    let guard = 0;
    while (pdfCacheOrder.length > MAX_PDF_DOCS && guard < pdfCacheOrder.length) {
        const oldUrl = pdfCacheOrder[0];
        // Never evict the document currently on screen
        if (oldUrl === currentPdfUrl) {
            pdfCacheOrder.shift();
            pdfCacheOrder.push(oldUrl);
            guard++;
            continue;
        }
        pdfCacheOrder.shift();
        delete pdfCache[oldUrl];
    }
}

function pdfCacheGet(url) {
    const doc = pdfCache[url];
    if (doc) pdfCacheTouch(url);
    return doc || null;
}

// Loads (or returns an already-loading / already-loaded) PDF document.
// Shared by both the "user clicked a topic" path and the background prefetch path.
function getOrLoadDocument(url, onProgress) {
    if (!url || typeof url !== 'string') {
        return Promise.reject(new Error('getOrLoadDocument called with invalid url: ' + url));
    }

    const cached = pdfCacheGet(url);
    if (cached) return Promise.resolve(cached);

    if (pdfLoadPromises[url]) return pdfLoadPromises[url];

    const loadingTask = pdfjsLib.getDocument({
        url,
        disableRange: false,
        disableStream: false,
        rangeChunkSize: 65536,
        disableFontFace: true,
        cMapPacked: true,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
    });
    if (onProgress) loadingTask.onProgress = onProgress;

    const promise = loadingTask.promise.then(doc => {
        pdfCacheSet(url, doc);
        delete pdfLoadPromises[url];
        return doc;
    }).catch(err => {
        delete pdfLoadPromises[url];
        throw err;
    });

    pdfLoadPromises[url] = promise;
    return promise;
}

// === LRU Page Cache (max 40 entries) ===
const LRU_MAX = 40;
const lruKeys = [];
const renderedPageCache = {};
function lruSet(key, value) {
    const idx = lruKeys.indexOf(key);
    if (idx !== -1) lruKeys.splice(idx, 1);
    lruKeys.push(key);
    renderedPageCache[key] = value;
    while (lruKeys.length > LRU_MAX) {
        const old = lruKeys.shift();
        delete renderedPageCache[old];
    }
}
function lruGet(key) {
    const idx = lruKeys.indexOf(key);
    if (idx === -1) return null;
    lruKeys.splice(idx, 1);
    lruKeys.push(key);
    return renderedPageCache[key];
}
function lruHas(key) {
    return Object.prototype.hasOwnProperty.call(renderedPageCache, key);
}

// === Canvas Pool (reuse offscreen canvases) ===
const canvasPool = [];
function getPooledCanvas() {
    return canvasPool.pop() || document.createElement('canvas');
}
function returnCanvas(c) {
    if (canvasPool.length < 8) canvasPool.push(c);
}

const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
canvas.style.imageRendering = 'auto';

// DOM Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const topicList = document.getElementById('topicList');
const currentTopicLabel = document.getElementById('currentTopic');
const welcomeMsg = document.getElementById('welcomeMessage');
const loadingMsg = document.getElementById('loadingMessage');
const pageWrapper = document.getElementById('pageWrapper');
const skeleton = document.getElementById('skeletonShimmer');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const viewerContainer = document.getElementById('viewerContainer');

// === Responsive: Auto-scale PDF to container width ===
function getAutoScale(page) {
    const containerW = viewerContainer.clientWidth - 32; // padding
    const defaultVP = page.getViewport({ scale: 1.0 });
    if (window.innerWidth <= 768 || defaultVP.width > containerW) {
        return Math.min(containerW / defaultVP.width, 2.0);
    }
    return scale;
}

// === Hamburger Sidebar Toggle ===
function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarBackdrop.classList.toggle('active');
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
}
hamburgerBtn.addEventListener('click', toggleSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

// === Hover-to-prefetch: start warming a PDF as soon as the pointer
// rests on its sidebar entry, so a click lands on an already-loaded doc ===
const HOVER_PREFETCH_DELAY = 130; // ms
const hoverTimers = new WeakMap();

function markPrefetched(btn) {
    if (btn) btn.classList.add('prefetched');
}

function prefetchTopicDocument(topic, btn) {
    const url = encodeURI(topic.pdf);
    if (pdfCacheGet(url)) { markPrefetched(btn); return Promise.resolve(); }
    return getOrLoadDocument(url).then(doc => {
        markPrefetched(btn);
        // Warm the first page too (low-res is enough to feel instant on open,
        // full-res keeps building in the background via renderPage's own logic).
        return prefetchFirstPage(doc, url);
    }).catch(() => { });
}

async function prefetchFirstPage(doc, url) {
    try {
        const page = await doc.getPage(1);
        const predictedScale = getAutoScale(page) || scale;
        const key = pageCacheKey(url, 1, predictedScale);
        if (lruHas(key)) return;
        const result = await renderToCanvas(doc, 1, predictedScale);
        lruSet(key, result);
    } catch (e) { /* best-effort */ }
}

// Warm the topics immediately before/after the one just opened —
// mirrors how SlideShare quietly loads the next slide while you read the current one.
function prefetchNeighbors(index) {
    const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 60));
    [index + 1, index - 1, index + 2].forEach(i => {
        if (i < 0 || i >= topics.length) return;
        scheduleIdle(() => {
            const topic = topics[i];
            const btn = topicButtons[i];
            prefetchTopicDocument(topic, btn);
        });
    });
}

// Populate Sidebar
const topicButtons = [];
topics.forEach((topic, index) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.innerText = topic.name.replace(/_/g, ' ');
    btn.onclick = () => {
        loadPDF(topic.pdf, btn, topic.name, topic.spotify_link, index);
        closeSidebar();
    };
    btn.addEventListener('mouseenter', () => {
        const timer = setTimeout(() => prefetchTopicDocument(topic, btn), HOVER_PREFETCH_DELAY);
        hoverTimers.set(btn, timer);
    });
    btn.addEventListener('mouseleave', () => {
        const timer = hoverTimers.get(btn);
        if (timer) clearTimeout(timer);
    });
    li.appendChild(btn);
    topicList.appendChild(li);
    topicButtons.push(btn);
});

function pageCacheKey(url, num, s) {
    return `${url}:${num}:${s.toFixed(2)}`;
}

async function loadPDF(url, btnElement, topicName, spotifyLink, topicIndex) {
    const myGeneration = ++loadGeneration;

    document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    currentTopicLabel.innerText = topicName.replace(/_/g, ' ');
    currentTopicIndex = typeof topicIndex === 'number' ? topicIndex : topics.findIndex(t => t.pdf === url);

    welcomeMsg.style.display = 'none';

    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');

    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;

    // Update Spotify
    const spotifyPlayer = document.getElementById('spotifyPlayer');
    if (spotifyLink) {
        const embedUrl = spotifyLink.replace('open.spotify.com/', 'open.spotify.com/embed/').split('?')[0] + '?utm_source=generator';
        spotifyPlayer.src = embedUrl;
    } else {
        spotifyPlayer.src = 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator';
    }

    const encodedUrl = encodeURI(url);
    currentPdfUrl = encodedUrl;

    // Already warm (hover-prefetched or previously viewed) — practically instant
    const cachedDoc = pdfCacheGet(encodedUrl);
    if (cachedDoc) {
        pdfDoc = cachedDoc;
        loadingMsg.style.display = 'none';
        pageWrapper.classList.remove('active');
        skeleton.classList.remove('active');
        pageWrapper.classList.add('active');
        renderPage(pageNum);
        prefetchNeighbors(currentTopicIndex);
        return;
    }

    pageWrapper.classList.remove('active');
    skeleton.classList.remove('active');
    loadingMsg.style.display = 'block';
    loadingText.textContent = 'Loading...';
    progressBar.style.width = '0%';

    try {
        const doc = await getOrLoadDocument(encodedUrl, (progress) => {
            if (myGeneration !== loadGeneration) return;
            if (progress.total > 0) {
                const pct = Math.round((progress.loaded / progress.total) * 100);
                progressBar.style.width = pct + '%';
            }
        });
        if (myGeneration !== loadGeneration) return;

        pdfDoc = doc;
        loadingMsg.style.display = 'none';
        pageWrapper.classList.add('active');
        renderPage(pageNum);
        prefetchNeighbors(currentTopicIndex);
    } catch (error) {
        if (myGeneration !== loadGeneration) return;
        console.error('Error loading PDF:', error);
        loadingText.textContent = 'Error loading PDF';
        progressBar.style.width = '0%';
    }
}

// Render page to pooled offscreen canvas
async function renderToCanvas(doc, num, renderScale, pixelRatio = DEVICE_PIXEL_RATIO) {
    const page = await doc.getPage(num);
    const viewport = page.getViewport({ scale: renderScale * pixelRatio });
    const offscreen = getPooledCanvas();
    offscreen.width = viewport.width;
    offscreen.height = viewport.height;
    const offCtx = offscreen.getContext('2d');
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    await page.render({ canvasContext: offCtx, viewport }).promise;
    return {
        canvas: offscreen,
        width: viewport.width / pixelRatio,
        height: viewport.height / pixelRatio,
        pixelRatio
    };
}

function displayOnCanvas(result, displayWidth, displayHeight) {
    const pixelRatio = result.pixelRatio || DEVICE_PIXEL_RATIO;
    canvas.width = Math.round(displayWidth * pixelRatio);
    canvas.height = Math.round(displayHeight * pixelRatio);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(result.canvas, 0, 0, displayWidth, displayHeight);
}

// Prefetch adjacent pages with requestIdleCallback
const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
function prefetchPages(num, doc, url, gen) {
    const pages = [];
    if (num + 1 <= doc.numPages) pages.push(num + 1);
    if (num - 1 >= 1) pages.push(num - 1);
    if (num + 2 <= doc.numPages) pages.push(num + 2);
    if (num + 3 <= doc.numPages) pages.push(num + 3);

    pages.forEach(p => {
        const key = pageCacheKey(url, p, scale);
        if (!renderedPageCache[key]) {
            scheduleIdle(() => {
                if (gen !== loadGeneration) return;
                if (!renderedPageCache[key]) {
                    renderToCanvas(doc, p, scale).then(result => {
                        if (gen === loadGeneration) {
                            lruSet(key, result);
                        }
                    }).catch(() => { });
                }
            });
        }
    });
}

async function renderPage(num) {
    pageRendering = true;
    const myGeneration = loadGeneration;
    const myDoc = pdfDoc;
    const myUrl = currentPdfUrl;

    // Auto-scale on mobile
    const firstPage = await myDoc.getPage(num);
    if (myGeneration !== loadGeneration) { pageRendering = false; return; }
    const effectiveScale = getAutoScale(firstPage);
    scale = effectiveScale;

    const fullKey = pageCacheKey(myUrl, num, scale);

    // Update UI
    pageInfo.textContent = `Page ${num} of ${myDoc.numPages}`;
    prevBtn.disabled = num <= 1;
    nextBtn.disabled = num >= myDoc.numPages;

    // CASE 1: Cached — instant display, no skeleton flash at all
    const cached = lruGet(fullKey);
    if (cached) {
        skeleton.classList.remove('active');
        displayOnCanvas(cached, cached.width, cached.height);
        canvas.style.opacity = '1';
        pageRendering = false;
        if (pageNumPending !== null) {
            const p = pageNumPending; pageNumPending = null;
            renderPage(p);
        }
        prefetchPages(num, myDoc, myUrl, myGeneration);
        return;
    }

    // Show skeleton shimmer
    const fullViewport = firstPage.getViewport({ scale });
    canvas.width = Math.round(fullViewport.width * DEVICE_PIXEL_RATIO);
    canvas.height = Math.round(fullViewport.height * DEVICE_PIXEL_RATIO);
    canvas.style.width = `${fullViewport.width}px`;
    canvas.style.height = `${fullViewport.height}px`;
    skeleton.classList.add('active');

    // CASE 2: Progressive rendering
    try {
        // Low-res preview
        const lowRes = await renderToCanvas(myDoc, num, LOW_RES_SCALE);
        if (myGeneration !== loadGeneration) { pageRendering = false; return; }
        displayOnCanvas(lowRes, fullViewport.width, fullViewport.height);
        returnCanvas(lowRes.canvas);
        canvas.style.opacity = '1';
        skeleton.classList.remove('active');

        // Full quality
        const fullRes = await renderToCanvas(myDoc, num, scale);
        if (myGeneration !== loadGeneration) { pageRendering = false; return; }
        lruSet(fullKey, fullRes);
        displayOnCanvas(fullRes, fullRes.width, fullRes.height);

        pageRendering = false;
        if (pageNumPending !== null) {
            const p = pageNumPending; pageNumPending = null;
            renderPage(p);
        }
    } catch (err) {
        if (myGeneration === loadGeneration) console.error('Render error:', err);
        skeleton.classList.remove('active');
        pageRendering = false;
    }

    if (myGeneration === loadGeneration) {
        prefetchPages(num, myDoc, myUrl, myGeneration);
    }
}

function queueRenderPage(num) {
    if (pageRendering) { pageNumPending = num; } else { renderPage(num); }
}

function onPrevPage() { if (pageNum <= 1) return; pageNum--; queueRenderPage(pageNum); }
function onNextPage() { if (!pdfDoc || pageNum >= pdfDoc.numPages) return; pageNum++; queueRenderPage(pageNum); }
function zoomIn() { scale = Math.min(scale * 1.2, 3); if (pdfDoc) renderPage(pageNum); }
function zoomOut() { scale = Math.max(scale / 1.2, 0.5); if (pdfDoc) renderPage(pageNum); }

prevBtn.addEventListener('click', onPrevPage);
nextBtn.addEventListener('click', onNextPage);
document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);

// === Touch Swipe Navigation ===
let touchStartX = 0;
let touchStartY = 0;
viewerContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });
viewerContainer.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNextPage();
        else onPrevPage();
    }
}, { passive: true });

// === Debounced Resize Handler ===
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (pdfDoc) renderPage(pageNum);
    }, 250);
});

// Keyboard navigation + download prevention
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation(); return false;
    }
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    if (e.key === 'PrintScreen') { e.preventDefault(); return false; }
    if (!pdfDoc) return;
    switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); onPrevPage(); break;
        case 'ArrowRight': e.preventDefault(); onNextPage(); break;
        case '+': case '=': e.preventDefault(); zoomIn(); break;
        case '-': e.preventDefault(); zoomOut(); break;
    }
});

document.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// === Idle-time warm-up: quietly parse the first couple of topics
// shortly after page load, so the very first click is fast too ===
(function warmStart() {
    const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    scheduleIdle(() => {
        [0, 1].forEach(i => {
            if (topics[i]) prefetchTopicDocument(topics[i], topicButtons[i]);
        });
    });
})();
