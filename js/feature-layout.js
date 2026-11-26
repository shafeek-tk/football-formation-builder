// Feature: page layout.
// Gives the controls a clear order instead of one long row of buttons:
//   1. Formations - home and away
//   2. Squad   - names, team splitter, kits (the things you do to your players)
//   3. Pitch   - with undo, redo and a "More" menu right above it
//   4. Share   - link, image, WhatsApp (a bar fixed to the bottom on phones)
// Everything else (image options, copy as text, recent, reset, help, install)
// lives in the More menu. On wide screens the pitch is the centrepiece:
// setting up (formations, squad) on its left, sharing on its right with a
// live preview of the image people will get. Buttons are moved, never rebuilt, so every feature keeps
// working with its own button.
EFL.css('css/feature-layout.css?v=1795676037');

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

    const WIDE = window.matchMedia('(min-width: 1100px)');
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

        // 1. Formations (the game-size tabs stay up top, under the title)
        const match = el('section', 'st-card st-match', '<h2 class="st-head">Teams & formations</h2>');
        ['.formation-container'].forEach(sel => {
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

        // Wide screens: the pitch in the centre, setting up on the left and
        // sharing (with a live preview of the image) on the right
        const right = el('aside', 'studio-side studio-right');
        studio.appendChild(right);
        const preview = el('figure', 'ly-preview', '<canvas class="ly-preview-canvas" aria-label="Preview of the shared image"></canvas><figcaption>Live preview of your image</figcaption>');
        const extras = el('div', 'ly-share-extras');
        const arrange = () => {
            if (WIDE.matches) {
                share.querySelector('.st-head').textContent = 'Share your lineup';
                share.insertBefore(preview, share.querySelector('.st-head').nextSibling);
                share.appendChild(extras);
                ['imageOptionsBtn', 'copyTextBtn'].forEach(id => { const b = document.getElementById(id); if (b) extras.appendChild(b); });
                right.appendChild(share);
                document.body.classList.add('is-wide');
                schedulePreview();
            } else {
                share.querySelector('.st-head').textContent = 'Share';
                document.body.classList.remove('is-wide');
                placeTools(true); // image options and copy-as-text go back into the More menu
                preview.remove();
                extras.remove();
                side.appendChild(share);
            }
            if (more.open) closeMenu();
            window.dispatchEvent(new Event('resize'));
        };
        more.arrange = arrange;
        arrange();
        WIDE.addEventListener?.('change', arrange);

        const tools = document.getElementById('toolsBar');
        if (tools && window.MutationObserver) new MutationObserver(placeTools).observe(tools, { childList: true });
        // The phone pitch is sized from what sits above it
        window.dispatchEvent(new Event('resize'));
    }

    /** Move each tool button from the old row to its place. */
    // ---- Live preview of the shared image (wide screens) ----
    let previewTimer = 0, previewBusy = false, previewAgain = false;

    function schedulePreview() {
        if (!WIDE.matches) return;
        clearTimeout(previewTimer);
        previewTimer = setTimeout(drawPreview, 450);
    }

    async function drawPreview() {
        const canvas = document.querySelector('.ly-preview-canvas');
        const builder = window.formationBuilder;
        if (!canvas || !builder || !builder.renderExport || !WIDE.matches) return;
        if (document.body.classList.contains('efl-dragging')) { schedulePreview(); return; }
        if (previewBusy) { previewAgain = true; return; }
        previewBusy = true;
        try {
            if (document.fonts) await document.fonts.ready;
            const full = await builder.renderExport();
            const w = canvas.clientWidth || 260;
            const ratio = window.devicePixelRatio || 1;
            canvas.width = Math.round(w * ratio);
            canvas.height = Math.round(w * ratio * full.height / full.width);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(full, 0, 0, canvas.width, canvas.height);
            canvas.dataset.ready = '1';
        } catch (e) { /* the preview is a nicety; never break the page for it */ }
        previewBusy = false;
        if (previewAgain) { previewAgain = false; schedulePreview(); }
    }

    EFL.on('render', schedulePreview);
    EFL.on('change', schedulePreview);
    document.addEventListener('input', e => { if (e.target.closest && e.target.closest('#field .player-name, .efl-panel')) schedulePreview(); });
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.efl-panel')) schedulePreview(); });

    function placeTools(force) {
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

        const loose = [...tools.children];
        if (force === true) ['imageOptionsBtn', 'copyTextBtn'].forEach(id => { const b = document.getElementById(id); if (b && !b.closest('#moreMenu')) loose.push(b); });
        if (WIDE.matches && document.querySelector('.ly-share-extras')) {
            ['imageOptionsBtn', 'copyTextBtn'].forEach(id => {
                const i = loose.findIndex(b => b.id === id);
                if (i >= 0) document.querySelector('.ly-share-extras').appendChild(loose.splice(i, 1)[0]);
            });
        }
        loose.forEach(b => {
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
