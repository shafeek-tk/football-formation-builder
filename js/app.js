// Page wiring shared by every format page: the share bar buttons, the toast,
// and small UI helpers (tool buttons, panels) that optional features use.

const SHARE_MESSAGE = "Here's my lineup for today 👇 ";

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('visible'), 2500);
}

/** Load a feature stylesheet once. */
EFL.css = function (href) {
    if (document.querySelector(`link[data-efl-css="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.eflCss = href;
    document.head.appendChild(link);
};

/**
 * Add a button to the tools row under the formation pickers.
 * Lower `order` comes first, so buttons keep a stable order whichever
 * features are merged.
 */
EFL.addTool = function ({ id, label, title, order = 50, onClick }) {
    const bar = document.getElementById('toolsBar');
    if (!bar || document.getElementById(id)) return null;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = 'tool-btn';
    btn.textContent = label;
    if (title) btn.title = title;
    btn.dataset.order = order;
    btn.addEventListener('click', onClick);
    const after = [...bar.children].find(el => Number(el.dataset.order) > order);
    bar.insertBefore(btn, after || null);
    bar.hidden = false;
    return btn;
};

/** Phones show panels, pickers and menus as a short tray along the bottom. */
EFL.PHONE = window.matchMedia('(max-width: 600px)');

/**
 * Keep the visible area (above the on-screen keyboard) in CSS variables, so a
 * tray always sits just above the keyboard and its close button stays on screen.
 */
(function () {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
        const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        root.style.setProperty('--vv-top', vv.offsetTop + 'px');
        root.style.setProperty('--vv-h', vv.height + 'px');
        root.classList.toggle('kb-open', kb > 120);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
})();

/**
 * With a tray open on a phone, scroll the pitch into the space above it so
 * changes show as they happen. `end` picks which half matters most:
 * 'bottom' (home team, the default) or 'top' (away team).
 */
EFL.revealPitch = function (tray, end = 'bottom') {
    const field = document.getElementById('field');
    if (!EFL.PHONE.matches || !field || !tray) return;
    requestAnimationFrame(() => {
        const trayH = tray.getBoundingClientRect().height;
        document.body.style.paddingBottom = trayH + 'px';
        const f = field.getBoundingClientRect();
        const room = window.innerHeight - trayH;
        let delta = end === 'top' || f.height <= room - 16
            ? f.top - 8
            : f.bottom - (room - 8);
        window.scrollBy({ top: delta, behavior: 'smooth' });
    });
};

EFL.releasePitch = function () {
    document.body.style.paddingBottom = '';
};

/**
 * Open a simple dialog panel. `build(body, close)` fills the body element;
 * `onClose()` runs however the panel is closed. Returns the close function.
 * On phones it is a short tray with the pitch still in view above it.
 */
EFL.openPanel = function ({ title, build, onClose }) {
    EFL.closePanel();
    const overlay = document.createElement('div');
    overlay.className = 'efl-panel-overlay';
    overlay.innerHTML = `
        <div class="efl-panel" role="dialog" aria-modal="true" aria-label="${title}">
            <div class="efl-panel-head">
                <h2>${title}</h2>
                <button type="button" class="efl-panel-close" aria-label="Close">×</button>
            </div>
            <div class="efl-panel-body"></div>
        </div>`;
    overlay._onClose = onClose;
    const close = () => EFL.closePanel();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.efl-panel-close').addEventListener('click', close);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', EFL._escClose);
    build(overlay.querySelector('.efl-panel-body'), close);
    if (EFL.PHONE.matches) {
        // No keyboard popping up on open: it comes when a text box is tapped
        EFL.revealPitch(overlay.querySelector('.efl-panel'));
    } else {
        const first = overlay.querySelector('textarea, input, select, button:not(.efl-panel-close)');
        if (first) first.focus();
    }
    return close;
};

EFL._escClose = function (e) {
    if (e.key === 'Escape') EFL.closePanel();
};

EFL.closePanel = function () {
    document.querySelectorAll('.efl-panel-overlay').forEach(el => {
        el.remove();
        if (el._onClose) el._onClose();
    });
    document.removeEventListener('keydown', EFL._escClose);
    EFL.releasePitch();
};

async function shareToWhatsApp() {
    const builder = window.formationBuilder;
    const shareUrl = builder.buildShareUrl();
    const text = SHARE_MESSAGE + shareUrl;
    EFL.track('share_whatsapp');
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
            const canvas = await builder.renderExport();
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'lineup.png', { type: 'image/png' });
            await navigator.share({ text, files: [file] });
            return;
        } catch (e) {
            if (e && e.name === 'AbortError') return;
        }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const on = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    on('copyLinkBtn', () => window.formationBuilder.shareFormation());
    on('downloadBtn', () => window.formationBuilder.downloadImage());
    on('whatsappBtn', shareToWhatsApp);
});
