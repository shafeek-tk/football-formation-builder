// Feature: substitutes bench.
// A row of subs under the pitch for each team. Tap a sub, then a player on
// the pitch, to swap them. Subs appear in the share image and link (key "b").

(function () {
    const KEY = { 'my-team': 'h', 'opp-team': 'a' };
    let bench = { h: [], a: [] };
    let selected = null; // { team, i }

    const teamLabel = team => (EFL.teamName ? EFL.teamName(team) : (team === 'my-team' ? 'Home' : 'Away'));
    const hasTeam = team => !!document.querySelector(`#field .player.${team}`);

    EFL.benchNames = team => (bench[KEY[team]] || []).slice();
    EFL.setBench = (team, names) => {
        bench[KEY[team]] = names.map(n => String(n).trim().toUpperCase()).filter(Boolean);
        render();
    };
    EFL.benchLines = () => ['my-team', 'opp-team']
        .filter(team => hasTeam(team) && bench[KEY[team]].length)
        .map(team => `${teamLabel(team).toUpperCase()} SUBS: ${bench[KEY[team]].join(', ')}`);

    EFL.on('state:collect', state => {
        if (bench.h.length || bench.a.length) state.b = { h: bench.h.slice(), a: bench.a.slice() };
    });
    EFL.on('state:apply', state => {
        const b = state.b || {};
        bench = { h: (b.h || []).slice(), a: (b.a || []).slice() };
    });
    EFL.on('reset', () => { bench = { h: [], a: [] }; });

    function changed() {
        localStorage.setItem('eflBench', JSON.stringify(bench));
        render();
        EFL.emit('change', 'bench');
    }

    function clearSelection() {
        selected = null;
        document.getElementById('field')?.classList.remove('bench-picking');
        render();
    }

    function render() {
        const box = document.getElementById('benchBox');
        if (!box) return;
        box.innerHTML = '';
        ['my-team', 'opp-team'].filter(hasTeam).forEach(team => {
            const side = KEY[team];
            const row = document.createElement('div');
            row.className = `bench-row ${team}`;
            row.innerHTML = `<span class="bench-label">${teamLabel(team)} subs</span>`;
            bench[side].forEach((name, i) => {
                const chip = document.createElement('span');
                chip.className = 'bench-chip' + (selected && selected.team === team && selected.i === i ? ' is-selected' : '');
                chip.innerHTML = `<button type="button" class="bench-name"></button><button type="button" class="bench-remove" aria-label="Remove ${name}">×</button>`;
                chip.querySelector('.bench-name').textContent = name;
                chip.querySelector('.bench-name').addEventListener('click', () => {
                    if (selected && selected.team === team && selected.i === i) { clearSelection(); return; }
                    selected = { team, i };
                    document.getElementById('field')?.classList.add('bench-picking');
                    render();
                    showToast('Now tap a player on the pitch to swap.');
                });
                chip.querySelector('.bench-remove').addEventListener('click', () => {
                    bench[side].splice(i, 1);
                    selected = null;
                    changed();
                });
                row.appendChild(chip);
            });
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'bench-add';
            add.textContent = '+ Add sub';
            add.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'bench-input';
                input.maxLength = 20;
                input.placeholder = 'Name';
                add.replaceWith(input);
                input.focus();
                const commit = () => {
                    const v = input.value.trim().toUpperCase();
                    if (v) { bench[side].push(v); changed(); } else render();
                };
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
                    if (e.key === 'Escape') { input.value = ''; input.blur(); }
                });
                input.addEventListener('blur', commit, { once: true });
            });
            row.appendChild(add);
            box.appendChild(row);
        });
    }

    // While a sub is selected, a tap on a pitch player swaps them
    function onFieldClick(e) {
        if (!selected) return;
        const player = e.target.closest('.player');
        if (!player) return;
        e.preventDefault();
        e.stopPropagation();
        const builder = window.formationBuilder;
        const team = player.dataset.team, index = Number(player.dataset.index);
        const side = KEY[selected.team];
        const subName = bench[side][selected.i];
        const pitchName = builder.getPlayerName(team, index);
        bench[side][selected.i] = pitchName;
        builder.savePlayerName(team, index, subName);
        player.querySelector('.player-name').textContent = subName;
        player.classList.add('swap-complete');
        setTimeout(() => player.classList.remove('swap-complete'), 400);
        document.activeElement?.blur?.();
        selected = null;
        document.getElementById('field')?.classList.remove('bench-picking');
        changed();
        EFL.track('bench_swap');
    }

    // Without the branded frame, add the subs as a strip under the pitch image
    EFL.on('export', canvas => {
        if (EFL.hasBrandedExport) return canvas;
        const lines = EFL.benchLines();
        if (!lines.length) return canvas;
        const lineH = Math.round(canvas.width * 0.045);
        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height + lineH * (lines.length + 0.6);
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(canvas, 0, 0);
        ctx.fillStyle = '#e8eaf0';
        ctx.font = `500 ${Math.round(lineH * 0.55)}px Oswald, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        lines.forEach((line, i) => ctx.fillText(line, out.width / 2, canvas.height + lineH * (i + 0.8), out.width * 0.94));
        return out;
    });

    EFL.on('render', render);

    EFL.on('ready', () => {
        EFL.css('css/feature-bench.css?v=1795660000');
        if (!window.location.hash) {
            try { bench = { h: [], a: [], ...JSON.parse(localStorage.getItem('eflBench') || '{}') }; } catch (e) { /* empty */ }
        }
        const box = document.createElement('div');
        box.id = 'benchBox';
        box.className = 'bench';
        document.querySelector('.field-container')?.after(box);
        document.getElementById('field')?.addEventListener('click', onFieldClick, true);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && selected) clearSelection(); });
        render();
    });
})();
