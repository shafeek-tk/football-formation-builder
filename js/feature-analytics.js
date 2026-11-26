// Feature: usage analytics.
// Sends each user action recorded with EFL.track() to Google Analytics as an
// event, plus formation and format changes, so you can see which features
// people use and what drives shares. No names or lineup content are sent.

(function () {
    function send(action, params = {}) {
        if (typeof window.gtag !== 'function') return;
        const game = window.formationBuilder?.config.gameType;
        window.gtag('event', action, { game_type: game, ...params });
    }

    EFL.on('track', send);

    EFL.on('ready', () => {
        [['myTeamFormation', 'home'], ['awayTeamFormation', 'away']].forEach(([id, side]) => {
            const select = document.getElementById(id);
            select?.addEventListener('change', () => send('formation_change', { side, formation: select.value }));
        });
        document.querySelectorAll('.mode-toggle a').forEach(a => {
            a.addEventListener('click', () => send('format_switch', { to: a.textContent.trim() }));
        });
        if (window.location.hash.startsWith('#f=')) send('open_shared_link');
    });
})();
