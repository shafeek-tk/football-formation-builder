// Feature: drag players.
// Drag a player onto another player to swap them, or onto open grass to
// move them anywhere. Tap a name to edit it. Replaces the Edit/Swap toggle.
// Moved positions travel in the share link (key "p") and reset when that
// team's formation changes.

(function () {
    const DRAG_THRESHOLD = 6;           // px of movement before a press becomes a drag
    const KEY = { 'my-team': 'h', 'opp-team': 'a' };
    const SELECT = { h: 'myTeamFormation', a: 'awayTeamFormation' };

    // positions = { h: { f: '231', p: { 3: [x, y] } }, a: {...} } in field %
    let positions = { h: null, a: null };
    let drag = null;
    const EDGE = 48;                    // px from the top/bottom of the screen that scrolls the page

    const formationOf = side => document.getElementById(SELECT[side])?.value || '';
    const round = n => Math.round(n * 10) / 10;

    function positionsFor(side) {
        const entry = positions[side];
        return entry && entry.f === formationOf(side) ? entry.p : null;
    }

    EFL.on('state:collect', state => {
        const out = {};
        ['h', 'a'].forEach(side => {
            const p = positionsFor(side);
            if (p && Object.keys(p).length) out[side] = { f: positions[side].f, p };
        });
        if (Object.keys(out).length) state.p = out;
    });
    EFL.on('state:apply', state => {
        positions = { h: null, a: null, ...(state.p || {}) };
    });
    EFL.on('reset', () => { positions = { h: null, a: null }; });

    EFL.on('render', () => {
        document.querySelectorAll('#field .player').forEach(el => {
            const p = positionsFor(KEY[el.dataset.team]);
            const pos = p && p[el.dataset.index];
            if (pos) {
                el.style.left = pos[0] + '%';
                el.style.top = pos[1] + '%';
                el.classList.add('is-moved');
            }
        });
    });

    function fieldPercent(field, clientX, clientY) {
        const r = field.getBoundingClientRect();
        return [
            Math.min(97, Math.max(3, ((clientX - r.left) / r.width) * 100)),
            Math.min(97, Math.max(3, ((clientY - r.top) / r.height) * 100))
        ];
    }

    function playerAt(x, y, except) {
        return document.elementsFromPoint(x, y)
            .map(el => el.closest && el.closest('#field .player'))
            .find(el => el && el !== except) || null;
    }

    function onPointerDown(e) {
        if (e.button !== 0 || drag) return;
        const player = e.currentTarget;
        drag = {
            player, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
            left: player.style.left, top: player.style.top, active: false, target: null
        };
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerCancel);
    }

    function startDrag() {
        drag.active = true;
        const el = document.activeElement;
        if (el && el.classList && el.classList.contains('player-name')) el.blur();
        window.getSelection()?.removeAllRanges();
        drag.player.classList.add('is-dragging');
        document.body.classList.add('efl-dragging');
        try { drag.player.setPointerCapture(drag.pointerId); } catch (err) { /* not supported */ }
    }

    function moveTo(clientX, clientY) {
        const field = document.getElementById('field');
        const [x, y] = fieldPercent(field, clientX, clientY);
        drag.player.style.left = x + '%';
        drag.player.style.top = y + '%';
        const target = playerAt(clientX, clientY, drag.player);
        if (target !== drag.target) {
            drag.target?.classList.remove('drop-target');
            target?.classList.add('drop-target');
            drag.target = target;
        }
    }

    // Scroll the page while a player is held near the top or bottom edge,
    // so a player can be dragged across a pitch taller than the screen.
    function autoScroll() {
        if (!drag || !drag.active) return;
        const y = drag.lastY, h = window.innerHeight;
        const step = y < EDGE ? -Math.ceil((EDGE - y) / 4) : y > h - EDGE ? Math.ceil((y - (h - EDGE)) / 4) : 0;
        if (step) {
            const before = window.scrollY;
            window.scrollBy(0, step);
            if (window.scrollY !== before) moveTo(drag.lastX, drag.lastY);
        }
        drag.raf = requestAnimationFrame(autoScroll);
    }

    function onPointerMove(e) {
        if (!drag || e.pointerId !== drag.pointerId) return;
        if (!drag.active) {
            if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
            startDrag();
            drag.raf = requestAnimationFrame(autoScroll);
        }
        e.preventDefault();
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        moveTo(e.clientX, e.clientY);
    }

    function cleanup() {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerCancel);
        document.body.classList.remove('efl-dragging');
        if (drag) {
            cancelAnimationFrame(drag.raf);
            drag.player.classList.remove('is-dragging');
            drag.target?.classList.remove('drop-target');
        }
        drag = null;
    }

    function swallowNextClick() {
        const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
        document.addEventListener('click', stop, { capture: true, once: true });
        setTimeout(() => document.removeEventListener('click', stop, { capture: true }), 50);
    }

    function onPointerUp(e) {
        if (!drag || e.pointerId !== drag.pointerId) return;
        const d = drag;
        if (!d.active) { cleanup(); return; }
        swallowNextClick();
        const builder = window.formationBuilder;
        if (d.target) {
            d.player.style.left = d.left;
            d.player.style.top = d.top;
            const target = d.target;
            cleanup();
            builder.executeSwap(d.player, target);
            EFL.track('drag_swap');
        } else {
            const side = KEY[d.player.dataset.team];
            const field = document.getElementById('field');
            const [x, y] = fieldPercent(field, e.clientX, e.clientY);
            if (!positionsFor(side)) positions[side] = { f: formationOf(side), p: {} };
            positions[side].p[d.player.dataset.index] = [round(x), round(y)];
            d.player.classList.add('is-moved');
            cleanup();
            EFL.emit('change', 'move');
            EFL.track('drag_move');
        }
    }

    function onPointerCancel() {
        if (drag && drag.active) {
            drag.player.style.left = drag.left;
            drag.player.style.top = drag.top;
        }
        cleanup();
    }

    EFL.on('player:created', player => {
        player.addEventListener('pointerdown', onPointerDown);
    });

    /** Put every moved player back in formation. */
    function resetPositions() {
        positions = { h: null, a: null };
        window.formationBuilder.loadFormation();
        EFL.emit('change', 'move');
    }
    EFL.resetPositions = resetPositions;

    // One interaction: tap to edit, drag to move or swap. No mode toggle.
    FormationBuilder.prototype.createInteractionToggle = function () {
        const container = document.getElementById('interactionToggleContainer');
        if (!container) return;
        container.innerHTML = `
            <div class="interaction-hint">Tap a name to edit · Drag a player to move or swap</div>
            <button type="button" class="tool-link" id="resetPositionsBtn" hidden>Put players back in formation</button>`;
        container.querySelector('#resetPositionsBtn').addEventListener('click', resetPositions);
    };

    EFL.on('render', () => {
        const btn = document.getElementById('resetPositionsBtn');
        if (btn) btn.hidden = !document.querySelector('#field .player.is-moved');
    });
    EFL.on('change', kind => {
        if (kind !== 'move') return;
        const btn = document.getElementById('resetPositionsBtn');
        if (btn) btn.hidden = !document.querySelector('#field .player.is-moved');
    });

    EFL.on('ready', () => EFL.css('css/feature-drag-drop.css?v=1795666007'));
})();
