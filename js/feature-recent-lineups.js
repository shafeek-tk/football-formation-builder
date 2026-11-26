// Feature: recent lineups.
// Each time a lineup is shared or saved it is kept on this device (last 12,
// across all formats), so last week's teams are one tap away.

(function () {
    const STORE = 'eflRecent';
    const LIMIT = 12;
    const SAVE_ON = ['share_link', 'save_image', 'share_whatsapp', 'copy_text'];

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; }
    }

    function label(builder) {
        const name = team => (EFL.teamName ? EFL.teamName(team) : null);
        const home = name('my-team'), away = name('opp-team');
        const teams = home && away && (home !== 'Home' || away !== 'Away') ? `${home} v ${away}` : '';
        const first = [...document.querySelectorAll('#field .my-team .player-name')].map(el => el.textContent.trim()).filter(Boolean).slice(0, 3);
        return teams || first.join(', ') || builder.config.gameType;
    }

    EFL.saveRecent = function () {
        const builder = window.formationBuilder;
        const url = builder.buildShareUrl();
        const hash = url.slice(url.indexOf('#'));
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const list = load().filter(item => !(item.page === page && item.hash === hash));
        list.unshift({ page, hash, game: builder.config.gameType, label: label(builder), at: Date.now() });
        localStorage.setItem(STORE, JSON.stringify(list.slice(0, LIMIT)));
    };

    EFL.on('track', action => {
        if (SAVE_ON.includes(action)) EFL.saveRecent();
    });

    function when(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) +
            ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }

    function openPanel() {
        EFL.openPanel({
            title: 'Recent lineups',
            build(body) {
                const draw = () => {
                    const list = load();
                    body.innerHTML = list.length ? '' : '<p class="efl-hint">Lineups you share or save will appear here, on this device only.</p>';
                    list.forEach((item, i) => {
                        const row = document.createElement('div');
                        row.className = 'recent-row';
                        row.innerHTML = `
                            <a class="recent-open" href="${item.page}${item.hash}">
                                <span class="recent-label"></span>
                                <span class="recent-meta">${item.game} · ${when(item.at)}</span>
                            </a>
                            <button type="button" class="recent-remove" aria-label="Remove">×</button>`;
                        row.querySelector('.recent-label').textContent = item.label;
                        row.querySelector('.recent-open').addEventListener('click', () => {
                            EFL.track('open_recent');
                            // Same page with a new hash: load it without a full navigation
                            if (item.page === (window.location.pathname.split('/').pop() || 'index.html')) {
                                setTimeout(() => { window.formationBuilder.loadFromURL(); EFL.closePanel(); }, 0);
                            }
                        });
                        row.querySelector('.recent-remove').addEventListener('click', () => {
                            const next = load();
                            next.splice(i, 1);
                            localStorage.setItem(STORE, JSON.stringify(next));
                            draw();
                        });
                        body.appendChild(row);
                    });
                    const actions = document.createElement('div');
                    actions.className = 'efl-panel-actions';
                    actions.innerHTML = '<button type="button" class="efl-btn efl-btn--primary">Save current lineup</button>';
                    actions.firstElementChild.addEventListener('click', () => { EFL.saveRecent(); draw(); showToast('Saved on this device.'); });
                    body.appendChild(actions);
                };
                draw();
            }
        });
    }

    EFL.on('ready', () => {
        EFL.css('css/feature-recent-lineups.css?v=1795660000');
        EFL.addTool({ id: 'recentBtn', label: 'Recent', title: 'Lineups you shared or saved on this device', order: 60, onClick: openPanel });
    });
})();
