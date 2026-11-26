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

/**
 * Open a simple dialog panel. `build(body, close)` fills the body element.
 * Returns the close function.
 */
EFL.openPanel = function ({ title, build }) {
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
    const close = () => EFL.closePanel();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.efl-panel-close').addEventListener('click', close);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', EFL._escClose);
    build(overlay.querySelector('.efl-panel-body'), close);
    const first = overlay.querySelector('textarea, input, select, button:not(.efl-panel-close)');
    if (first) first.focus();
    return close;
};

EFL._escClose = function (e) {
    if (e.key === 'Escape') EFL.closePanel();
};

EFL.closePanel = function () {
    document.querySelectorAll('.efl-panel-overlay').forEach(el => el.remove());
    document.removeEventListener('keydown', EFL._escClose);
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
