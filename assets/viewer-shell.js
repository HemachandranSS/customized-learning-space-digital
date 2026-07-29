const viewerShell = (() => {
    let hideSpotifyTimer = null;

    function getElement(id) {
        return document.getElementById(id);
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

    function showSpotify() {
        const audioSection = getElement('audioSection');
        if (!audioSection) return;
        audioSection.classList.add('visible');
        if (hideSpotifyTimer) clearTimeout(hideSpotifyTimer);
        hideSpotifyTimer = setTimeout(() => {
            audioSection.classList.remove('visible');
        }, 2500);
    }

    function hideSpotify() {
        const audioSection = getElement('audioSection');
        if (!audioSection) return;
        if (hideSpotifyTimer) clearTimeout(hideSpotifyTimer);
        audioSection.classList.remove('visible');
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

        let pointerTimer = null;
        const reveal = () => {
            showSpotify();
            if (pointerTimer) clearTimeout(pointerTimer);
            pointerTimer = setTimeout(() => hideSpotify(), 2500);
        };

        document.addEventListener('pointermove', reveal, { passive: true });
        audioSection.addEventListener('touchstart', reveal, { passive: true });
    }

    function init() {
        bindSidebar();
        bindSpotify();
        closeSidebar();
        hideSpotify();
    }

    return { init, openSidebar, closeSidebar, toggleSidebar, showSpotify, hideSpotify };
})();

document.addEventListener('DOMContentLoaded', () => viewerShell.init());
