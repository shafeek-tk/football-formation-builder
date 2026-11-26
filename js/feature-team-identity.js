// Feature: team identity.
// Team names, kit colours and a captain's armband for each side. Shown on
// the pitch, in the share image, and carried in the share link (key "t").

(function () {
    const KITS = [
        ['Blue', '#1f6fe0'], ['Red', '#d7263d'], ['Green', '#16a34a'], ['Yellow', '#facc15'],
        ['Orange', '#f97316'], ['Purple', '#7c3aed'], ['Sky', '#38bdf8'], ['Pink', '#ec4899'],
        ['Claret', '#7f1d3a'], ['Navy', '#1e3a8a'], ['Black', '#1f2937'], ['White', '#f8fafc']
    ];
    const DEFAULTS = { 'my-team': { label: 'Home', c: '#1f6fe0' }, 'opp-team': { label: 'Away', c: '#d7263d' } };
    const KEY = { 'my-team': 'h', 'opp-team': 'a' };
    const STORE = 'eflTeams';

    let teams = { h: {}, a: {} };
    try { teams = { h: {}, a: {}, ...JSON.parse(localStorage.getItem(STORE) || '{}') }; } catch (e) { /* defaults */ }

    const get = team => teams[KEY[team]] || {};
    const save = () => localStorage.setItem(STORE, JSON.stringify(teams));

    EFL.teamName = team => get(team).n || DEFAULTS[team].label;
    EFL.teamColor = team => get(team).c || DEFAULTS[team].c;

    function isLight(hex) {
        const n = parseInt(hex.slice(1), 16);
        const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
    }

    EFL.on('state:collect', state => {
        const clean = t => Object.fromEntries(Object.entries(t).filter(([, v]) => v !== '' && v !== undefined && v !== null));
        const h = clean(teams.h), a = clean(teams.a);
        if (Object.keys(h).length || Object.keys(a).length) state.t = { h, a };
    });
    // A link (or undo step) without "t" means default names and kits
    EFL.on('state:apply', state => {
        const t = state.t || {};
        teams = { h: { ...(t.h || {}) }, a: { ...(t.a || {}) } };
        save();
    });
    EFL.on('reset', () => { teams = { h: {}, a: {} }; save(); });

    function applyToPage() {
        const field = document.getElementById('field');
        if (!field) return;
        ['my-team', 'opp-team'].forEach(team => {
            const side = KEY[team];
            const color = EFL.teamColor(team);
            field.style.setProperty(`--kit-${side}`, color);
            field.style.setProperty(`--kit-${side}-ink`, isLight(color) ? '#111827' : '#ffffff');

            // Captain armband
            field.querySelectorAll(`.player.${team} .captain-badge`).forEach(el => el.remove());
            const cap = get(team).k;
            if (cap !== undefined && cap !== null && cap !== '') {
                const player = field.querySelector(`.player.${team}[data-index="${cap}"] .player-icon`);
                if (player) {
                    const badge = document.createElement('span');
                    badge.className = 'captain-badge';
                    badge.textContent = 'C';
                    badge.title = 'Captain';
                    player.appendChild(badge);
                }
            }

            // Team names are shown beside the pitch and on the image header, not on the grass
            field.querySelectorAll(`.team-tag.${team}`).forEach(el => el.remove());
        });
        document.querySelector('.home-label')?.replaceChildren(`${EFL.teamName('my-team')}:`);
        document.querySelector('.away-label')?.replaceChildren(`${EFL.teamName('opp-team')}:`);
    }

    EFL.on('render', applyToPage);

    // Draw the armband and team tags on the exported image
    EFL.on('export:player', (ctx, player, origin, scale) => {
        const badge = player.querySelector('.captain-badge');
        if (!badge) return;
        const r = badge.getBoundingClientRect();
        const x = r.left - origin.left + r.width / 2, y = r.top - origin.top + r.height / 2;
        const rad = r.width / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.lineWidth = Math.max(0.6, rad * 0.18);
        ctx.strokeStyle = '#111827';
        ctx.stroke();
        ctx.fillStyle = '#111827';
        ctx.font = `700 ${rad * 1.3}px Oswald, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', x, y + rad * 0.08);
        ctx.restore();
    });

    EFL.on('export:field', (ctx, { field, origin }) => {
        field.querySelectorAll('.team-tag').forEach(tag => {
            const r = tag.getBoundingClientRect();
            const cs = getComputedStyle(tag);
            const x = r.left - origin.left, y = r.top - origin.top;
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            roundedRectPath(ctx, x, y, r.width, r.height, parseFloat(cs.borderTopLeftRadius) || 4);
            ctx.fill();
            ctx.fillStyle = cs.borderLeftColor;
            ctx.fillRect(x, y, parseFloat(cs.borderLeftWidth) || 3, r.height);
            ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            ctx.fillStyle = '#fff';
            ctx.textBaseline = 'middle';
            const text = cs.textTransform === 'uppercase' ? tag.textContent.toUpperCase() : tag.textContent;
            ctx.fillText(text, x + parseFloat(cs.paddingLeft), y + r.height / 2 + 0.5);
            ctx.restore();
        });
    });

    function teamFields(team, title) {
        const side = KEY[team];
        const t = get(team);
        const swatches = KITS.map(([name, hex]) => `
            <button type="button" class="kit-swatch${EFL.teamColor(team) === hex ? ' is-on' : ''}" data-color="${hex}"
                style="--swatch:${hex}" aria-label="${name}" title="${name}"></button>`).join('');
        const players = [...document.querySelectorAll(`#field .player.${team}`)]
            .map(el => `<option value="${el.dataset.index}"${String(t.k) === el.dataset.index ? ' selected' : ''}>${Number(el.dataset.index) + 1}. ${el.querySelector('.player-name').textContent || 'Player'}</option>`)
            .join('');
        return `
            <fieldset class="team-fields" data-side="${side}">
                <legend>${title}</legend>
                <label for="tiName_${side}">Team name</label>
                <input type="text" id="tiName_${side}" maxlength="24" placeholder="${DEFAULTS[team].label}">
                <label>Kit colour</label>
                <div class="kit-swatches">${swatches}</div>
                <label for="tiCap_${side}">Captain</label>
                <select id="tiCap_${side}"><option value="">No captain</option>${players}</select>
            </fieldset>`;
    }

    function openPanel() {
        const hasAway = !!document.querySelector('#field .player.opp-team');
        EFL.openPanel({
            title: 'Teams',
            build(body, close) {
                body.innerHTML = teamFields('my-team', 'Home team') + (hasAway ? teamFields('opp-team', 'Away team') : '') + `
                    <div class="efl-panel-actions">
                        <button type="button" class="efl-btn efl-btn--primary" id="tiDone">Done</button>
                    </div>`;
                body.querySelectorAll('.team-fields').forEach(fs => {
                    const side = fs.dataset.side;
                    fs.querySelector(`#tiName_${side}`).value = teams[side].n || '';
                    fs.querySelectorAll('.kit-swatch').forEach(sw => sw.addEventListener('click', () => {
                        fs.querySelectorAll('.kit-swatch').forEach(s => s.classList.toggle('is-on', s === sw));
                    }));
                });
                body.querySelector('#tiDone').addEventListener('click', () => {
                    body.querySelectorAll('.team-fields').forEach(fs => {
                        const side = fs.dataset.side;
                        const team = side === 'h' ? 'my-team' : 'opp-team';
                        const color = fs.querySelector('.kit-swatch.is-on')?.dataset.color;
                        const cap = fs.querySelector(`#tiCap_${side}`).value;
                        teams[side] = {
                            n: fs.querySelector(`#tiName_${side}`).value.trim(),
                            c: color && color !== DEFAULTS[team].c ? color : '',
                            k: cap === '' ? '' : Number(cap)
                        };
                    });
                    save();
                    applyToPage();
                    EFL.emit('change', 'teams');
                    EFL.track('team_identity');
                    close();
                });
            }
        });
    }

    EFL.on('ready', () => {
        EFL.css('css/feature-team-identity.css?v=1795660000');
        EFL.addTool({ id: 'teamsBtn', label: 'Team names & kits', title: 'Team names, kit colours and captains', order: 30, onClick: openPanel });
        applyToPage();
    });
})();
