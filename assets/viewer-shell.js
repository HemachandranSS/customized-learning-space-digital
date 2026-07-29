const viewerShell = (() => {
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
        bindSidebar();
        bindSpotify();
        closeSidebar();
        setSpotifyExpanded(false);
    }

    return { init, openSidebar, closeSidebar, toggleSidebar, setSpotifyExpanded, toggleSpotify };
})();

document.addEventListener('DOMContentLoaded', () => viewerShell.init());
