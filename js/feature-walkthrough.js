// Feature: first-visit walkthrough.
// New visitors get a short guided tour (edit a name, drag to swap or move,
// the tools, sharing). A "How it works" button in the tools row replays it.
EFL.css('css/feature-walkthrough.css?v=1795666007');

(function () {
    const SEEN_KEY = 'eflTourSeen';
    const isPhone = () => window.matchMedia('(max-width: 600px)').matches;

    const STEPS = [
        {
            target: () => pickPlayer(0, '.player-name'),
            title: 'Add your players',
            text: 'Tap any name on the pitch and type to change it.'
        },
        {
            target: () => pickPlayer(1, '.player-icon'),
            title: 'Swap or move',
            text: 'Drag a shirt onto another player to swap them, or onto the grass to put them anywhere.'
        },
        {
            target: () => document.querySelector('.st-squad') || document.getElementById('toolsBar'),
            title: 'Your squad',
            text: 'Paste every name at once, split players into fair teams, and pick kit colours. Undo, redo and more options are close by.'
        },
        {
            target: () => document.querySelector('.share-bar'),
            title: 'Share it',
            text: 'Send the lineup to your group as a link, an image, or straight to WhatsApp.'
        }
    ];

    let tour = null;

    // A player that's already on screen, so the page doesn't jump around.
    // `nth` picks a different player for each step.
    function pickPlayer(nth, part) {
        const players = [...document.querySelectorAll('#field .player')];
        if (!players.length) return null;
        const bar = document.querySelector('.share-bar');
        const fixedBar = bar && getComputedStyle(bar).position === 'fixed';
        const bottom = fixedBar ? bar.getBoundingClientRect().top : window.innerHeight;
        const mid = bottom / 2;
        const onScreen = players.filter(p => { const r = p.getBoundingClientRect(); return r.top > 8 && r.bottom < bottom - 8; });
        const pool = (onScreen.length ? onScreen : players).slice()
            .sort((a, b) => Math.abs(a.getBoundingClientRect().top - mid) - Math.abs(b.getBoundingClientRect().top - mid));
        const player = pool[Math.min(nth, pool.length - 1)];
        return player.querySelector(part) || player;
    }

    function seen() {
        try { return !!localStorage.getItem(SEEN_KEY); } catch (e) { return true; }
    }

    function markSeen() {
        try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode */ }
    }

    function start() {
        end(false);
        markSeen();
        const spot = document.createElement('div');
        spot.className = 'efl-tour-spot';
        const card = document.createElement('div');
        card.className = 'efl-tour-card';
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-live', 'polite');
        document.body.append(spot, card);
        tour = { i: 0, spot, card };
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, { passive: true });
        document.addEventListener('keydown', onKey);
        show(0);
        EFL.track('tour_start');
    }

    function end(finished) {
        if (!tour) return;
        tour.spot.remove();
        tour.card.remove();
        window.removeEventListener('resize', place);
        window.removeEventListener('scroll', place);
        document.removeEventListener('keydown', onKey);
        if (finished !== false) EFL.track(finished ? 'tour_done' : 'tour_skip', { step: tour.i + 1 });
        tour = null;
    }

    function onKey(e) {
        if (e.key === 'Escape') end(false);
        else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
        else if (e.key === 'ArrowLeft') show(Math.max(0, tour.i - 1));
    }

    function next() {
        if (!tour) return;
        if (tour.i >= STEPS.length - 1) end(true);
        else show(tour.i + 1);
    }

    function show(i) {
        const step = STEPS[i];
        tour.i = i;
        const last = i === STEPS.length - 1;
        const text = typeof step.text === 'function' ? step.text() : step.text;
        tour.card.innerHTML = `
            <div class="efl-tour-count">${i + 1} of ${STEPS.length}</div>
            <div class="efl-tour-title">${step.title}</div>
            <p class="efl-tour-text">${text}</p>
            <div class="efl-tour-actions">
                <button type="button" class="efl-tour-skip">${last ? 'Close' : 'Skip'}</button>
                <button type="button" class="efl-tour-next">${last ? 'Got it' : 'Next'}</button>
            </div>`;
        tour.card.querySelector('.efl-tour-skip').addEventListener('click', () => end(last));
        tour.card.querySelector('.efl-tour-next').addEventListener('click', next);
        const el = step.target();
        tour.el = el;
        if (el && getComputedStyle(el).position !== 'fixed') {
            const r = el.getBoundingClientRect();
            if (r.top < 8 || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        place();
        tour.card.querySelector('.efl-tour-next').focus({ preventScroll: true });
    }

    function place() {
        if (!tour) return;
        const el = tour.el;
        const { spot, card } = tour;
        const vw = window.innerWidth, vh = window.innerHeight, pad = 6;
        if (!el) { spot.style.display = 'none'; return; }
        const r = el.getBoundingClientRect();
        spot.style.display = '';
        Object.assign(spot.style, {
            left: (r.left - pad) + 'px', top: (r.top - pad) + 'px',
            width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px'
        });
        const cw = card.offsetWidth, ch = card.offsetHeight, gap = 14;
        const below = r.bottom + pad + gap;
        const top = (r.top + r.height / 2 < vh / 2 && below + ch < vh - 8)
            ? below
            : Math.max(8, r.top - pad - gap - ch);
        const left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), vw - cw - 12);
        card.style.top = top + 'px';
        card.style.left = left + 'px';
    }

    EFL.on('ready', () => {
        EFL.addTool({ id: 'tourBtn', label: 'How it works', title: 'A quick tour of the builder', order: 5, onClick: start });
        if (!seen()) setTimeout(() => { if (!seen() && !document.querySelector('.efl-panel-overlay')) start(); }, 700);
    });

    EFL.startTour = start;
})();
