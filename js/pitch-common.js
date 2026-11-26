// Pitch rendering: a single vector (SVG) layer with mowed grass stripes and
// true-to-scale markings. The same SVG markup is used for the on-screen pitch
// and for the high-resolution exported image, so both always match.

const PITCH_STRIPES = 12;

/**
 * Build the pitch SVG markup for a field of the given pixel size.
 * Geometry follows a real 68m x 105m pitch: horizontal sizes scale with the
 * width, depths scale with the height, circles use the width scale so they
 * stay perfectly round.
 */
function buildPitchSVG(W, H) {
    const pad = Math.max(8, W * 0.035);            // grass run-off outside the lines
    const x0 = pad, y0 = pad, w = W - pad * 2, h = H - pad * 2;
    const u = w / 68, v = h / 105;                 // metres -> px
    const cx = W / 2, cy = H / 2;
    const lw = Math.max(1.6, W / 260);             // line width
    const r = 9.15 * u;                            // centre circle / D radius
    const spotR = Math.max(2.2, lw * 1.35);
    const f = n => +n.toFixed(2);

    const paW = 40.32 * u, paD = 16.5 * v;         // penalty area
    const gaW = 18.32 * u, gaD = 5.5 * v;          // goal area
    const spotD = 11 * v;                          // penalty spot distance
    const goalW = 7.32 * u, goalD = Math.min(pad * 0.85, 2.4 * v);
    const cr = Math.max(4, 1.4 * u);               // corner arc radius

    // Grass stripes (alternating mowing bands) over the full surface
    let stripes = '';
    const sh = H / PITCH_STRIPES;
    for (let i = 0; i < PITCH_STRIPES; i++) {
        stripes += `<rect class="grass-stripe" x="0" y="${f(i * sh)}" width="${f(W)}" height="${f(sh + 0.5)}" fill="${i % 2 ? '#2f8a3b' : '#38963f'}"/>`;
    }

    // Penalty "D": the part of the 9.15m circle round the spot outside the box
    const dArc = (top) => {
        const dy = paD - spotD;
        if (r <= dy) return '';
        const dx = Math.sqrt(r * r - dy * dy);
        const yLine = top ? y0 + paD : y0 + h - paD;
        const sweep = top ? 0 : 1;
        return `<path class="penalty-d ${top ? 'top' : 'bottom'}" d="M${f(cx - dx)} ${f(yLine)} A${f(r)} ${f(r)} 0 0 ${sweep} ${f(cx + dx)} ${f(yLine)}"/>`;
    };

    const box = (cls, bw, bd, top) => {
        const y = top ? y0 : y0 + h - bd;
        return `<rect class="${cls} ${top ? 'top' : 'bottom'}" x="${f(cx - bw / 2)}" y="${f(y)}" width="${f(bw)}" height="${f(bd)}"/>`;
    };

    const goal = (top) => {
        const y = top ? y0 - goalD : y0 + h;
        return `<rect class="pitch-goal ${top ? 'top' : 'bottom'}" x="${f(cx - goalW / 2)}" y="${f(y)}" width="${f(goalW)}" height="${f(goalD)}" fill="url(#goalNet)" stroke="#fff" stroke-width="${f(lw)}"/>`;
    };

    const corner = (name, x, y, sx, sy) =>
        `<path class="corner-arc-line ${name}" d="M${f(x + sx * cr)} ${f(y)} A${f(cr)} ${f(cr)} 0 0 ${sx * sy > 0 ? 1 : 0} ${f(x)} ${f(y + sy * cr)}"/>`;

    const spot = (cls, y) => `<circle class="${cls}" cx="${f(cx)}" cy="${f(y)}" r="${f(spotR)}"/>`;

    const netGap = Math.max(3, W / 170);

    return `<svg class="pitch-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" width="${f(W)}" height="${f(H)}" preserveAspectRatio="none" aria-hidden="true">
<defs>
<radialGradient id="pitchLight" cx="50%" cy="50%" r="75%">
<stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/>
<stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="100%" stop-color="#000000" stop-opacity="0.28"/>
</radialGradient>
<pattern id="goalNet" width="${f(netGap)}" height="${f(netGap)}" patternUnits="userSpaceOnUse">
<rect width="${f(netGap)}" height="${f(netGap)}" fill="#ffffff" fill-opacity="0.18"/>
<path d="M0 0 L${f(netGap)} ${f(netGap)} M${f(netGap)} 0 L0 ${f(netGap)}" stroke="#ffffff" stroke-opacity="0.55" stroke-width="${f(Math.max(0.6, lw * 0.35))}"/>
</pattern>
</defs>
<g class="grass">${stripes}</g>
<rect class="pitch-light" x="0" y="0" width="${f(W)}" height="${f(H)}" fill="url(#pitchLight)"/>
<g class="pitch-lines" fill="none" stroke="#ffffff" stroke-opacity="0.92" stroke-width="${f(lw)}" stroke-linecap="round" stroke-linejoin="round">
<rect class="touchline" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}"/>
<line class="halfway-line" x1="${f(x0)}" y1="${f(cy)}" x2="${f(x0 + w)}" y2="${f(cy)}"/>
<circle class="centre-circle" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>
${box('penalty-box', paW, paD, true)}${box('penalty-box', paW, paD, false)}
${box('goal-box', gaW, gaD, true)}${box('goal-box', gaW, gaD, false)}
${dArc(true)}${dArc(false)}
${corner('top-left', x0, y0, 1, 1)}${corner('top-right', x0 + w, y0, -1, 1)}
${corner('bottom-left', x0, y0 + h, 1, -1)}${corner('bottom-right', x0 + w, y0 + h, -1, -1)}
</g>
<g class="pitch-spots" fill="#ffffff" fill-opacity="0.95">
${spot('centre-spot-dot', cy)}${spot('penalty-spot-dot top', y0 + spotD)}${spot('penalty-spot-dot bottom', y0 + h - spotD)}
</g>
${goal(true)}${goal(false)}
</svg>`;
}

function renderPitch(field) {
    const W = field.clientWidth, H = field.clientHeight;
    if (!W || !H) return;
    if (field._pitchSize === `${W}x${H}` && field.querySelector('.pitch-svg')) return;
    field._pitchSize = `${W}x${H}`;
    let layer = field.querySelector('.pitch-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.className = 'pitch-layer';
        field.insertBefore(layer, field.firstChild);
    }
    layer.innerHTML = buildPitchSVG(W, H);
}

// Common pitch initialization (called on every formation load)
function initializePitch() {
    const field = document.getElementById('field');
    if (!field) return;
    field._pitchSize = null;
    renderPitch(field);
    if (!field._pitchObserver && window.ResizeObserver) {
        field._pitchObserver = new ResizeObserver(() => renderPitch(field));
        field._pitchObserver.observe(field);
    }
}

// No-op kept for compatibility
function addPenaltyArcs() {}
