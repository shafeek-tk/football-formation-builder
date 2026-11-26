// Feature: branded share images.
// Wraps the exported pitch in a frame: team names and match details on top,
// the site address at the bottom, in three sizes (portrait, square for
// Instagram posts, 9:16 for stories and WhatsApp status).
// Match details travel in the share link (state key "m").

(function () {
    const SIZES = {
        portrait: { label: 'Portrait', w: null, h: null },
        square: { label: 'Square 1:1', w: 2160, h: 2160 },
        story: { label: 'Story 9:16', w: 1440, h: 2560 }
    };
    const PREFS_KEY = 'eflExportPrefs';
    const SITE = 'easyfootballlineup.com';
    const DEFAULT_KITS = { 'my-team': '#1f6fe0', 'opp-team': '#d7263d' };

    let match = { t: '', d: '', v: '' };
    let prefs = { size: 'portrait', frame: true };
    try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch (e) { /* keep defaults */ }

    EFL.hasBrandedExport = true;

    EFL.on('state:collect', state => {
        if (match.t || match.d || match.v) state.m = { ...match };
    });
    EFL.on('state:apply', state => {
        match = { t: '', d: '', v: '', ...(state.m || {}) };
    });
    EFL.on('reset', () => { match = { t: '', d: '', v: '' }; });

    const teamName = team => (EFL.teamName ? EFL.teamName(team) : (team === 'my-team' ? 'Home' : 'Away'));
    const teamColor = team => (EFL.teamColor ? EFL.teamColor(team) : DEFAULT_KITS[team]);
    const selectText = id => {
        const s = document.getElementById(id);
        return s ? s.options[s.selectedIndex].text : '';
    };

    function todayLabel() {
        return new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    }

    function fitText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let t = text;
        while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
        return t + '…';
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function drawHeader(ctx, x, y, w, h, builder) {
        const twoTeams = !!document.querySelector('#field .opp-team');
        const big = Math.round(h * 0.34);
        const small = Math.round(h * 0.17);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        const cx = x + w / 2;
        const titleY = y + h * 0.5;

        if (twoTeams) {
            const vs = '  VS  ';
            ctx.font = `700 ${big}px Oswald, system-ui, sans-serif`;
            const vsW = ctx.measureText(vs).width;
            const side = (w - vsW) / 2 - h * 0.35;
            const home = fitText(ctx, teamName('my-team').toUpperCase(), side);
            const away = fitText(ctx, teamName('opp-team').toUpperCase(), side);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(home, cx - vsW / 2, titleY);
            ctx.textAlign = 'left';
            ctx.fillText(away, cx + vsW / 2, titleY);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#8a93a6';
            ctx.font = `500 ${Math.round(big * 0.6)}px Oswald, system-ui, sans-serif`;
            ctx.fillText('VS', cx, titleY - big * 0.08);
            // Kit colour bars under each name
            const barY = titleY + big * 0.22, barH = Math.max(4, big * 0.09);
            ctx.font = `700 ${big}px Oswald, system-ui, sans-serif`;
            const hw = ctx.measureText(home).width, aw = ctx.measureText(away).width;
            ctx.fillStyle = teamColor('my-team');
            ctx.fillRect(cx - vsW / 2 - hw, barY, hw, barH);
            ctx.fillStyle = teamColor('opp-team');
            ctx.fillRect(cx + vsW / 2, barY, aw, barH);
        } else {
            ctx.font = `700 ${big}px Oswald, system-ui, sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(fitText(ctx, teamName('my-team').toUpperCase(), w * 0.9), cx, titleY);
        }

        const formations = twoTeams
            ? `${selectText('myTeamFormation')} v ${selectText('awayTeamFormation')}`
            : selectText('myTeamFormation');
        const details = [match.t, match.d || todayLabel(), match.v, `${builder.config.gameType} · ${formations}`]
            .filter(Boolean).join('  ·  ');
        ctx.font = `400 ${small}px Oswald, system-ui, sans-serif`;
        ctx.fillStyle = '#b8c0d0';
        ctx.fillText(fitText(ctx, details, w * 0.94), cx, y + h * 0.86);
    }

    function drawFooter(ctx, x, y, w, h) {
        const size = Math.round(h * 0.42);
        ctx.font = `500 ${size}px Oswald, system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8a93a6';
        const label = `Made with  ⚽  ${SITE}`;
        ctx.fillText(label, x + w / 2, y + h / 2);
    }

    function drawBench(ctx, x, y, w, h) {
        const lines = EFL.benchLines ? EFL.benchLines() : [];
        if (!lines.length) return;
        const size = Math.round(h / (lines.length + 0.6) * 0.62);
        ctx.font = `500 ${size}px Oswald, system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d1d5e0';
        lines.forEach((line, i) => {
            ctx.fillText(fitText(ctx, line, w * 0.94), x + w / 2, y + (i + 0.8) * (h / (lines.length + 0.6)));
        });
    }

    /** Compose the framed image around the pitch canvas. */
    async function frame(pitch, builder) {
        if (!prefs.frame) return pitch;
        try { await document.fonts.load('700 40px Oswald'); } catch (e) { /* fall back to system font */ }

        const size = SIZES[prefs.size] || SIZES.portrait;
        const benchCount = EFL.benchLines ? EFL.benchLines().length : 0;
        let W, H;
        const base = size.w || pitch.width;
        const pad = Math.round(base * 0.045);
        const headerH = Math.round(base * 0.15);
        const footerH = Math.round(base * 0.055);
        const benchH = benchCount ? Math.round(base * 0.035 * (benchCount + 0.6)) : 0;

        let pw = pitch.width, ph = pitch.height;
        if (size.w) {
            W = size.w; H = size.h;
            const boxW = W - pad * 2, boxH = H - headerH - footerH - benchH - pad;
            const k = Math.min(boxW / pw, boxH / ph);
            pw = Math.round(pw * k); ph = Math.round(ph * k);
        } else {
            W = pitch.width + pad * 2;
            H = headerH + ph + benchH + footerH + pad;
        }

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1d2333');
        bg.addColorStop(1, '#121620');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        drawHeader(ctx, pad, pad * 0.4, W - pad * 2, headerH - pad * 0.4, builder);

        const freeH = H - headerH - footerH - benchH - pad;
        const px = Math.round((W - pw) / 2);
        const py = Math.round(headerH + (size.w ? (freeH - ph) / 2 : 0));
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = pad * 0.6;
        ctx.shadowOffsetY = pad * 0.15;
        roundRect(ctx, px, py, pw, ph, pw * 0.02);
        ctx.fillStyle = '#2f8a3b';
        ctx.fill();
        ctx.restore();
        ctx.save();
        roundRect(ctx, px, py, pw, ph, pw * 0.02);
        ctx.clip();
        ctx.drawImage(pitch, px, py, pw, ph);
        ctx.restore();

        if (benchH) drawBench(ctx, pad, py + ph + pad * 0.3, W - pad * 2, benchH);
        drawFooter(ctx, 0, H - footerH - pad * 0.2, W, footerH);
        return canvas;
    }

    EFL.on('export', frame);

    function savePrefs() {
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    }

    function openOptions() {
        EFL.openPanel({
            title: 'Image options',
            build(body, close) {
                body.innerHTML = `
                    <label>Image size</label>
                    <div class="efl-seg" role="radiogroup">
                        ${Object.entries(SIZES).map(([key, s]) => `
                            <button type="button" class="efl-seg-btn${prefs.size === key ? ' is-on' : ''}" data-size="${key}" role="radio" aria-checked="${prefs.size === key}">${s.label}</button>`).join('')}
                    </div>
                    <label for="exMatch">Match title (optional)</label>
                    <input type="text" id="exMatch" maxlength="40" placeholder="Thursday 5-a-side">
                    <label for="exWhen">Date and time</label>
                    <input type="text" id="exWhen" maxlength="30" placeholder="${todayLabel()}">
                    <label for="exVenue">Venue (optional)</label>
                    <input type="text" id="exVenue" maxlength="40" placeholder="Powerleague, Pitch 3">
                    <label class="efl-check"><input type="checkbox" id="exFrame"> Show title and branding on the image</label>
                    <div class="efl-panel-actions">
                        <button type="button" class="efl-btn" id="exCancel">Cancel</button>
                        <button type="button" class="efl-btn efl-btn--primary" id="exSave">Save image</button>
                    </div>`;
                body.querySelector('#exMatch').value = match.t;
                body.querySelector('#exWhen').value = match.d;
                body.querySelector('#exVenue').value = match.v;
                body.querySelector('#exFrame').checked = prefs.frame;
                body.querySelectorAll('.efl-seg-btn').forEach(btn => btn.addEventListener('click', () => {
                    body.querySelectorAll('.efl-seg-btn').forEach(b => {
                        b.classList.toggle('is-on', b === btn);
                        b.setAttribute('aria-checked', b === btn);
                    });
                }));
                const apply = () => {
                    prefs.size = body.querySelector('.efl-seg-btn.is-on').dataset.size;
                    prefs.frame = body.querySelector('#exFrame').checked;
                    match = {
                        t: body.querySelector('#exMatch').value.trim(),
                        d: body.querySelector('#exWhen').value.trim(),
                        v: body.querySelector('#exVenue').value.trim()
                    };
                    savePrefs();
                    EFL.emit('change', 'match');
                };
                body.querySelector('#exCancel').addEventListener('click', close);
                body.querySelector('#exSave').addEventListener('click', () => {
                    apply();
                    close();
                    EFL.track('image_options', { size: prefs.size, frame: prefs.frame });
                    window.formationBuilder.downloadImage();
                });
            }
        });
    }

    EFL.on('ready', () => {
        EFL.css('css/feature-export-styles.css?v=1795660000');
        EFL.addTool({ id: 'imageOptionsBtn', label: 'Image options', title: 'Image size, match details and branding', order: 70, onClick: openOptions });
    });

    // For tests and other features
    EFL.exportPrefs = () => ({ ...prefs });
    EFL.setExportPrefs = p => { prefs = { ...prefs, ...p }; savePrefs(); };
})();
