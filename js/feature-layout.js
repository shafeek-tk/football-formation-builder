// Feature: page layout.
// Gives the controls a clear order instead of one long row of buttons:
//   1. Match   - game size and the two formations
//   2. Squad   - names, team splitter, kits (the things you do to your players)
//   3. Pitch   - with undo, redo and a "More" menu right above it
//   4. Share   - link, image, WhatsApp (a bar fixed to the bottom on phones)
// Everything else (image options, copy as text, recent, reset, help, install)
// lives in the More menu. On wide screens the controls sit in a column
// beside the pitch. Buttons are moved, never rebuilt, so every feature keeps
// working with its own button.
EFL.css('css/feature-layout.css?v=1795674985');

(function () {
    const SQUAD = [
        { id: 'bulkNamesBtn', short: 'Names', icon: '<path d="M4 6h16M4 12h10M4 18h7"/><path d="M17 15l2 2 3-4"/>' },
        { id: 'splitTeamsBtn', short: 'Split teams', icon: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M11 20c0-3 2.2-5 5-5s5 2 5 5"/>' },
        { id: 'teamsBtn', short: 'Kits', icon: '<path d="M8 3l-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3c-.5 1.7-2 3-4 3s-3.5-1.3-4-3z"/>' }
    ];
    const HISTORY = [
        { id: 'undoBtn', label: 'Undo', icon: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>' },
        { id: 'redoBtn', label: 'Redo', icon: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>' }
    ];
    // Order and headings inside the More menu; anything unknown goes last
    const MORE = [
        { title: 'Image & sharing', ids: ['imageOptionsBtn', 'copyTextBtn'] },
        { title: 'Lineup', ids: ['recentBtn', 'resetBtn'] },
        { title: 'Help', ids: ['tourBtn', 'installBtn'] }
    ];
    const svg = paths => `<svg class="ly-icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

    let more = null; // { btn, menu, backdrop, open }

    function el(tag, cls, html) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    function build() {
        if (document.querySelector('.studio')) return;
        const header = document.querySelector('.header');
        const fieldBox = document.querySelector('.field-container');
        const shareBar = document.querySelector('.share-bar');
        if (!header || !fieldBox || !shareBar) return;

        const studio = el('div', 'studio');
        const side = el('aside', 'studio-side');
        const main = el('div', 'studio-main');
        studio.append(side, main);
        header.after(studio);

        // 1. Match
        const match = el('section', 'st-card st-match', '<h2 class="st-head">Match</h2>');
        ['#modeToggleContainer', '.formation-container'].forEach(sel => {
            const node = document.querySelector(sel);
            if (node) match.appendChild(node);
        });
        side.appendChild(match);

        // 2. Squad
        const squad = el('section', 'st-card st-squad', '<h2 class="st-head">Squad</h2>');
        const squadRow = el('div', 'st-squad-row');
        squad.appendChild(squadRow);
        side.appendChild(squad);

        // 4. Share (on phones this bar is fixed to the bottom of the screen)
        const share = el('section', 'st-card st-share', '<h2 class="st-head">Share</h2>');
        share.appendChild(shareBar);
        side.appendChild(share);

        // 3. Pitch, with its own small toolbar
        const pitchBar = el('div', 'pitch-bar');
        const hint = document.getElementById('interactionToggleContainer');
        if (hint) pitchBar.appendChild(hint);
        const actions = el('div', 'pitch-actions');
        pitchBar.appendChild(actions);
        const cta = document.querySelector('.share-cta');
        if (cta) main.appendChild(cta);
        main.append(pitchBar, fieldBox);
        const bench = document.getElementById('benchBox');
        if (bench) main.appendChild(bench);

        // More menu
        const moreBtn = el('button', 'ly-icon-btn ly-more-btn', svg('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>') + '<span class="ly-more-label">More</span>');
        moreBtn.type = 'button';
        moreBtn.id = 'moreBtn';
        moreBtn.title = 'More options';
        moreBtn.setAttribute('aria-haspopup', 'menu');
        moreBtn.setAttribute('aria-expanded', 'false');
        const menu = el('div', 'ly-menu');
        menu.id = 'moreMenu';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;
        menu.innerHTML = '<div class="ly-menu-head"><span>More</span><button type="button" class="ly-menu-close" aria-label="Close">×</button></div>' +
            MORE.map((g, i) => `<div class="ly-menu-group" data-group="${i}"><div class="ly-menu-title">${g.title}</div></div>`).join('') +
            `<div class="ly-menu-group" data-group="${MORE.length}"><div class="ly-menu-title">Other</div></div>`;
        const backdrop = el('div', 'ly-backdrop');
        backdrop.hidden = true;
        document.body.append(backdrop, menu);
        actions.appendChild(moreBtn);
        more = { btn: moreBtn, menu, backdrop, open: false };

        moreBtn.addEventListener('click', () => (more.open ? closeMenu() : openMenu()));
        backdrop.addEventListener('click', () => closeMenu());
        menu.querySelector('.ly-menu-close').addEventListener('click', () => closeMenu(true));
        // An item does its own job first, then the menu closes
        menu.addEventListener('click', e => { if (e.target.closest('.tool-btn')) closeMenu(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && more.open) closeMenu(true); });
        window.addEventListener('resize', () => more.open && placeMenu());

        placeTools();
        const tools = document.getElementById('toolsBar');
        if (tools && window.MutationObserver) new MutationObserver(placeTools).observe(tools, { childList: true });
        // The phone pitch is sized from what sits above it
        window.dispatchEvent(new Event('resize'));
    }

    /** Move each tool button from the old row to its place. */
    function placeTools() {
        const tools = document.getElementById('toolsBar');
        if (!tools || !more) return;
        const squadRow = document.querySelector('.st-squad-row');
        const actions = document.querySelector('.pitch-actions');

        SQUAD.forEach(({ id, short, icon }) => {
            const b = document.getElementById(id);
            if (!b || b.closest('.st-squad-row')) return;
            const label = b.textContent.trim();
            b.classList.add('ly-squad-btn');
            b.setAttribute('aria-label', label);
            b.innerHTML = svg(icon) + `<span class="ly-long">${label}</span><span class="ly-short" aria-hidden="true">${short}</span>`;
            squadRow.appendChild(b);
        });
        // Keep the squad buttons in a fixed order whatever order they arrived in
        SQUAD.forEach(({ id }) => { const b = document.getElementById(id); if (b && b.parentElement === squadRow) squadRow.appendChild(b); });
        document.querySelector('.st-squad').hidden = !squadRow.children.length;

        HISTORY.forEach(({ id, label, icon }) => {
            const b = document.getElementById(id);
            if (!b || b.parentElement === actions) return;
            b.classList.add('ly-icon-btn');
            b.setAttribute('aria-label', label);
            b.innerHTML = svg(icon);
            actions.insertBefore(b, more.btn);
        });

        [...tools.children].forEach(b => {
            const g = MORE.findIndex(group => group.ids.includes(b.id));
            const group = more.menu.querySelector(`[data-group="${g < 0 ? MORE.length : g}"]`);
            b.classList.add('ly-menu-item');
            b.setAttribute('role', 'menuitem');
            group.appendChild(b);
        });
        // Order inside each group, and hide empty groups
        MORE.forEach((g, i) => {
            const group = more.menu.querySelector(`[data-group="${i}"]`);
            g.ids.forEach(id => { const b = document.getElementById(id); if (b && b.parentElement === group) group.appendChild(b); });
        });
        more.menu.querySelectorAll('.ly-menu-group').forEach(group => {
            group.hidden = !group.querySelector('.tool-btn');
        });
        tools.hidden = true;
    }

    function openMenu() {
        more.open = true;
        more.menu.hidden = false;
        more.backdrop.hidden = false;
        more.btn.setAttribute('aria-expanded', 'true');
        placeMenu();
        requestAnimationFrame(() => more.menu.classList.add('is-open'));
        const first = more.menu.querySelector('.ly-menu-item:not([hidden])');
        if (first) first.focus({ preventScroll: true });
    }

    function closeMenu(refocus) {
        if (!more || !more.open) return;
        more.open = false;
        more.menu.classList.remove('is-open');
        more.menu.hidden = true;
        more.backdrop.hidden = true;
        more.btn.setAttribute('aria-expanded', 'false');
        if (refocus) more.btn.focus({ preventScroll: true });
    }

    function placeMenu() {
        const { menu, btn } = more;
        const sheet = window.matchMedia('(max-width: 600px)').matches;
        menu.classList.toggle('is-sheet', sheet);
        if (sheet) { menu.style.left = menu.style.top = ''; return; }
        const r = btn.getBoundingClientRect();
        const w = menu.offsetWidth, h = menu.offsetHeight;
        menu.style.left = Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12)) + 'px';
        const below = r.bottom + 8;
        menu.style.top = (below + h < window.innerHeight - 8 ? below : Math.max(8, r.top - 8 - h)) + 'px';
    }

    EFL.on('ready', build);
    EFL.openMoreMenu = () => { if (more && !more.open) openMenu(); };
})();
