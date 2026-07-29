const viewerShell = (() => {
    const AUTH_STORAGE_KEY = 'clsp_auth_ok_date';
    const AUTH_PASSWORD_SUFFIX = '-hema';
    let authHiddenElements = [];

    function getElement(id) {
        return document.getElementById(id);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function expectedPassword() {
        return `${formatDate(new Date())}${AUTH_PASSWORD_SUFFIX}`;
    }

    function isAuthenticated() {
        return sessionStorage.getItem(AUTH_STORAGE_KEY) === formatDate(new Date());
    }

    function setAuthenticated(value) {
        if (value) sessionStorage.setItem(AUTH_STORAGE_KEY, formatDate(new Date()));
        else sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }

    function showAuthOverlay(onSuccess) {
        if (document.getElementById('authOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'authOverlay';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:9999',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:24px',
            'background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
            'backdrop-filter:blur(14px)'
        ].join(';');

        overlay.innerHTML = `
            <div style="width:min(100%,420px);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,0.35);color:#fff;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
                <div style="font-size:1.5rem;font-weight:700;margin-bottom:8px;">Protected Access</div>
                <div style="color:rgba(255,255,255,0.78);margin-bottom:18px;line-height:1.5;">Enter password</div>
                <form id="authForm" autocomplete="off">
                    <input id="authInput" type="password" placeholder="Enter the password" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.18);color:#fff;outline:none;font-size:1rem;" />
                    <div id="authError" style="min-height:20px;margin-top:10px;color:#ffb4b4;font-size:0.92rem;"></div>
                    <button type="submit" style="width:100%;margin-top:10px;padding:12px 14px;border:none;border-radius:12px;background:#8fd3f4;color:#0f2027;font-weight:700;cursor:pointer;">Unlock</button>
                </form>
            </div>
        `;

        authHiddenElements = Array.from(document.body.children).filter((child) => child.id !== 'authOverlay');
        authHiddenElements.forEach((child) => {
            child.dataset.authPrevDisplay = child.style.display;
            child.style.display = 'none';
        });

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const form = overlay.querySelector('#authForm');
        const input = overlay.querySelector('#authInput');
        const error = overlay.querySelector('#authError');
        input.focus();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (input.value.trim() === expectedPassword()) {
                setAuthenticated(true);
                document.body.style.overflow = '';
                authHiddenElements.forEach((child) => {
                    child.style.display = child.dataset.authPrevDisplay || '';
                    delete child.dataset.authPrevDisplay;
                });
                authHiddenElements = [];
                overlay.remove();
                onSuccess();
            } else {
                error.textContent = "Incorrect password. Try contact the site admin (hchandranss@gmail.com)";
                input.value = '';
                input.focus();
            }
        });
    }

    function openSidebar() {
        const sidebar = getElement('sidebar');
        const backdrop = getElement('sidebarBackdrop');
        if (!sidebar || !backdrop) return;
        sidebar.classList.add('open');
        backdrop.classList.add('active');
    }

    function closeSidebar() {
        const sidebar = getElement('sidebar');
        const backdrop = getElement('sidebarBackdrop');
        if (!sidebar || !backdrop) return;
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
    }

    function toggleSidebar() {
        const sidebar = getElement('sidebar');
        if (!sidebar) return;
        if (sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
    }

    function setSpotifyExpanded(expanded) {
        const audioSection = getElement('audioSection');
        const spotifyToggle = getElement('spotifyToggle');
        if (!audioSection) return;
        audioSection.classList.toggle('visible', expanded);
        if (spotifyToggle) {
            spotifyToggle.setAttribute('aria-expanded', String(expanded));
            spotifyToggle.textContent = expanded ? 'Hide Spotify' : 'Show Spotify';
        }
    }

    function toggleSpotify() {
        const audioSection = getElement('audioSection');
        if (!audioSection) return;
        setSpotifyExpanded(!audioSection.classList.contains('visible'));
    }

    function bindSidebar() {
        const hamburgerBtn = getElement('hamburgerBtn');
        const backdrop = getElement('sidebarBackdrop');
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
        if (backdrop) backdrop.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSidebar();
        });
    }

    function bindSpotify() {
        const audioSection = getElement('audioSection');
        if (!audioSection) return;

        let spotifyToggle = getElement('spotifyToggle');
        if (!spotifyToggle) {
            spotifyToggle = document.createElement('button');
            spotifyToggle.id = 'spotifyToggle';
            spotifyToggle.className = 'spotify-toggle';
            spotifyToggle.type = 'button';
            spotifyToggle.setAttribute('aria-expanded', 'false');
            spotifyToggle.textContent = 'Show Spotify';
            audioSection.prepend(spotifyToggle);
        }

        spotifyToggle.addEventListener('click', toggleSpotify);
    }

    function init() {
        if (!isAuthenticated()) {
            showAuthOverlay(() => {
                bindSidebar();
                bindSpotify();
                closeSidebar();
                setSpotifyExpanded(false);
            });
            return;
        }
        bindSidebar();
        bindSpotify();
        closeSidebar();
        setSpotifyExpanded(false);
    }

    return { init, openSidebar, closeSidebar, toggleSidebar, setSpotifyExpanded, toggleSpotify };
})();

document.addEventListener('DOMContentLoaded', () => viewerShell.init());
