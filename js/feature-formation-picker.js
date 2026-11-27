// Feature: formation picker.
// Replaces the look of the two plain formation dropdowns with a styled button
// that opens a picker of formation cards, each with a small diagram. The real
// <select> stays in the page (invisible, under the button), so share links,
// undo and every other feature keep working with it exactly as before.
EFL.css('css/feature-formation-picker.css?v=1795754907');

(function () {
    const PHONE = EFL.PHONE;
    let open = null; // { select, trigger, panel, backdrop }

    const SIDES = {
        myTeamFormation: { team: 'home', title: 'Home formation' },
        awayTeamFormation: { team: 'away', title: 'Away formation' }
    };

    /** Options grouped by the HTML comments in the select ("Most Common" etc.). */
    function groupsOf(select) {
        const groups = [];
        let current = null;
        select.childNodes.forEach(node => {
            if (node.nodeType === Node.COMMENT_NODE) {
                current = { title: node.textContent.trim().replace(/\s*\(.*\)$/, ''), options: [] };
                groups.push(current);
            } else if (node.tagName === 'OPTION') {
                if (!current) { current = { title: '', options: [] }; groups.push(current); }
                current.options.push(node);
            }
        });
        return groups.filter(g => g.options.length);
    }

    /** A tiny pitch with one dot per player, attacking upwards. */
    function diagram(layers) {
        if (!layers) return '';
        const n = layers.length, top = 16, bottom = 94;
        const dots = layers.map((layer, i) => {
            const y = i === 0 ? 120 : bottom - (bottom - top) * ((i - 1) / Math.max(1, n - 2));
            return layer.map(x => `<circle cx="${x}" cy="${y.toFixed(1)}" r="6.5"/>`).join('');
        }).join('');
        return `<svg class="fp-diagram" viewBox="0 0 100 132" aria-hidden="true">
            <rect class="fp-pitch" x="2" y="2" width="96" height="128" rx="8"/>
            <line class="fp-line" x1="2" y1="66" x2="98" y2="66"/>
            <rect class="fp-line" x="28" y="104" width="44" height="26" fill="none"/>
            ${dots}</svg>`;
    }

    function updateLabel(select) {
        const trigger = select.parentElement.querySelector('.fp-trigger');
        if (!trigger) return;
        const opt = select.options[select.selectedIndex];
        trigger.querySelector('.fp-value').textContent = opt ? opt.textContent.trim() : '';
    }

    function enhance(select) {
        if (select.dataset.fpReady) return;
        select.dataset.fpReady = '1';
        const side = SIDES[select.id] || { team: 'home', title: 'Formation' };
        const wrap = document.createElement('span');
        wrap.className = 'fp-wrap';
        select.parentNode.insertBefore(wrap, select);
        wrap.appendChild(select);
        select.classList.add('fp-native');
        // Inline so the plain dropdown never flashes up before the stylesheet loads
        Object.assign(select.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0', pointerEvents: 'none', minWidth: '0' });
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'fp-trigger fp-' + side.team;
        trigger.id = select.id + 'Picker';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', side.title);
        trigger.innerHTML = '<span class="fp-value"></span><svg class="fp-chevron" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1"/></svg>';
        wrap.appendChild(trigger);
        trigger.addEventListener('click', () => (open && open.select === select) ? close() : show(select, trigger, side));
        select.addEventListener('change', () => updateLabel(select));
        updateLabel(select);
    }

    function show(select, trigger, side) {
        close(false, true);
        document.querySelectorAll('.fp-panel.is-leaving').forEach(el => el.remove());
        const builder = window.formationBuilder;
        const formations = (builder && builder.formations) || {};
        const panel = document.createElement('div');
        panel.className = 'fp-panel fp-' + side.team;
        panel.setAttribute('role', 'listbox');
        panel.setAttribute('aria-label', side.title);
        const groups = groupsOf(select);
        panel.innerHTML = `
            <div class="fp-head">
                <span class="fp-title"><i class="fp-dot"></i>${side.title}</span>
                <button type="button" class="fp-close" aria-label="Close">×</button>
            </div>
            <div class="fp-body">${groups.map(g => `
                ${g.title && groups.length > 1 ? `<div class="fp-group">${g.title}</div>` : ''}
                <div class="fp-grid">${g.options.map(o => `
                    <button type="button" role="option" class="fp-option" data-value="${o.value}"
                        aria-selected="${o.value === select.value}" tabindex="-1">
                        ${diagram(formations[o.value])}
                        <span class="fp-label">${o.textContent.trim()}</span>
                    </button>`).join('')}
                </div>`).join('')}
            </div>`;

        const backdrop = document.createElement('div');
        backdrop.className = 'fp-backdrop';
        document.body.append(backdrop, panel);
        open = { select, trigger, panel, backdrop };
        trigger.setAttribute('aria-expanded', 'true');

        panel.querySelector('.fp-close').addEventListener('click', () => close(true));
        backdrop.addEventListener('click', () => close());
        panel.addEventListener('click', e => {
            const opt = e.target.closest('.fp-option');
            if (opt) choose(opt.dataset.value);
        });
        panel.addEventListener('keydown', onKey);
        position();
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, { passive: true });

        const current = panel.querySelector('.fp-option[aria-selected="true"]') || panel.querySelector('.fp-option');
        if (current) {
            current.tabIndex = 0;
            current.focus({ preventScroll: true });
            current.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
        if (panel.classList.contains('is-sheet')) {
            EFL.trayDrag(panel, panel.querySelector('.fp-head'), () => close(true));
            EFL.trayIn(panel);
            EFL.revealPitch(panel, side.team === 'away' ? 'top' : 'bottom');
        } else {
            requestAnimationFrame(() => panel.classList.add('is-open'));
        }
    }

    function choose(value) {
        const { select, panel } = open;
        // Phones: the tray stays open so you can try formations on the pitch
        const stay = panel.classList.contains('is-sheet');
        if (!stay) close(true);
        if (select.value === value) { if (stay) close(true); return; }
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        updateLabel(select);
        if (stay) panel.querySelectorAll('.fp-option').forEach(o => o.setAttribute('aria-selected', String(o.dataset.value === value)));
    }

    function close(refocus, instant) {
        if (!open) return;
        const { trigger, panel, backdrop } = open;
        open = null;
        trigger.setAttribute('aria-expanded', 'false');
        backdrop.remove();
        if (panel.classList.contains('is-sheet') && !instant) {
            panel.style.pointerEvents = 'none';
            EFL.trayOut(panel, () => panel.remove());
        } else {
            panel.remove();
        }
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position);
        if (!instant) EFL.releasePitch();
        if (refocus) trigger.focus({ preventScroll: true });
    }

    function position() {
        if (!open) return;
        const { panel, trigger } = open;
        if (PHONE.matches) { panel.classList.add('is-sheet'); panel.style.left = panel.style.top = ''; return; }
        panel.classList.remove('is-sheet');
        const r = trigger.getBoundingClientRect();
        const w = panel.offsetWidth, h = panel.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
        const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), vw - w - 12);
        const below = r.bottom + 8;
        const top = (below + h <= vh - 8 || r.top < vh / 2) ? below : Math.max(8, r.top - 8 - h);
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
    }

    function onKey(e) {
        const opts = [...open.panel.querySelectorAll('.fp-option')];
        const i = opts.indexOf(document.activeElement);
        const grid = document.activeElement.closest('.fp-grid');
        const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
        let next = null;
        if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
        if (e.key === 'Tab') { e.preventDefault(); close(true); return; }
        if (e.key === 'ArrowRight') next = i + 1;
        else if (e.key === 'ArrowLeft') next = i - 1;
        else if (e.key === 'ArrowDown') next = i + cols;
        else if (e.key === 'ArrowUp') next = i - cols;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = opts.length - 1;
        if (next === null || i < 0) return;
        e.preventDefault();
        next = Math.max(0, Math.min(opts.length - 1, next));
        opts.forEach(o => { o.tabIndex = -1; });
        opts[next].tabIndex = 0;
        opts[next].focus();
    }

    function enhanceAll() {
        document.querySelectorAll('#myTeamFormation, #awayTeamFormation').forEach(enhance);
    }

    // Share links, undo and reset change the selects in code; keep the buttons in step
    EFL.on('render', () => document.querySelectorAll('.fp-native').forEach(updateLabel));
    EFL.on('ready', enhanceAll);
    if (document.readyState !== 'loading') enhanceAll();
    else document.addEventListener('DOMContentLoaded', enhanceAll);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) close(true); });
})();
