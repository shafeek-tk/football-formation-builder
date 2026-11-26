// Feature: split a squad into two fair teams.
// Paste the list of who's playing (straight from WhatsApp is fine), add
// optional skill ratings, and get two balanced teams placed on the pitch.
//   "Sam 4"  or  "Sam ****"  -> skill 4 (1 to 5, default 3)
//   "Alex gk" or "Alex (GK)" -> goalkeeper, one per team where possible

(function () {
    const LIST_KEY = 'eflSquadList';
    const DEFAULT_SKILL = 3;

    /** Parse one pasted line into { name, skill, gk } or null. */
    EFL.parsePlayer = function (line) {
        let text = line
            .replace(/^\s*(\d+\s*[.)\-:]|[-*•·–—>]|\[[ xX]?\])\s*/, '')
            .replace(/[✅✔☑️]/g, '')
            .trim();
        if (!text) return null;
        let gk = false;
        text = text.replace(/\s*[([]?\b(gk|goalie|keeper)\b[)\]]?\s*/i, () => { gk = true; return ' '; }).trim();
        let skill = DEFAULT_SKILL, rated = false;
        const stars = text.match(/\s*(\*{1,5}|★{1,5})$/);
        const digit = text.match(/\s+([1-5])$/);
        if (stars) { skill = stars[1].length; rated = true; text = text.slice(0, -stars[0].length); }
        else if (digit) { skill = Number(digit[1]); rated = true; text = text.slice(0, -digit[0].length); }
        text = text.trim();
        return text ? { name: text, skill, gk, rated } : null;
    };

    EFL.parseSquad = function (text) {
        const seen = new Set();
        return text.split(/\r?\n/).map(EFL.parsePlayer).filter(p => {
            if (!p) return false;
            const key = p.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const total = team => team.reduce((sum, p) => sum + p.skill, 0);

    /**
     * Balanced random split: keepers first (one each), then a shuffled snake
     * draft by skill, then swaps that bring the totals closer. Team sizes
     * never differ by more than one.
     */
    EFL.splitSquad = function (players) {
        const teams = [[], []];
        const keepers = shuffle(players.filter(p => p.gk));
        const outfield = players.filter(p => !keepers.slice(0, 2).includes(p));
        keepers.slice(0, 2).forEach((k, i) => teams[i].push(k));

        // Shuffle first so equal-skill players land in a different order each time
        const ordered = shuffle(outfield).sort((a, b) => b.skill - a.skill);
        ordered.forEach(p => {
            const [a, b] = teams;
            let pick;
            if (a.length !== b.length) pick = a.length < b.length ? 0 : 1;
            else pick = total(a) <= total(b) ? 0 : 1;
            teams[pick].push(p);
        });

        // Improve with outfield swaps while it reduces the skill gap
        for (let pass = 0; pass < 50; pass++) {
            const gap = total(teams[0]) - total(teams[1]);
            if (gap === 0) break;
            let best = null;
            teams[0].forEach((p, i) => {
                if (p.gk && keepers.length) return;
                teams[1].forEach((q, j) => {
                    if (q.gk && keepers.length) return;
                    const newGap = Math.abs(gap - 2 * (p.skill - q.skill));
                    if (newGap < Math.abs(gap) && (!best || newGap < best.gap)) best = { i, j, gap: newGap };
                });
            });
            if (!best) break;
            [teams[0][best.i], teams[1][best.j]] = [teams[1][best.j], teams[0][best.i]];
        }
        // Keeper first, then strongest first so the best players get the first shirts
        return teams.map(t => {
            const keeper = t.find(p => p.gk);
            const rest = t.filter(p => p !== keeper).sort((a, b) => b.skill - a.skill);
            return keeper ? [keeper, ...rest] : rest;
        });
    };

    function spots(team) {
        return document.querySelectorAll(`#field .player.${team}`).length;
    }

    function applyTeams(teams) {
        const builder = window.formationBuilder;
        const subs = [];
        ['my-team', 'opp-team'].forEach((team, t) => {
            const size = spots(team);
            const list = teams[t].map(p => p.name);
            for (let i = 0; i < size; i++) builder.playerNames[`${team}_${i}`] = (list[i] || '').toUpperCase();
            const extra = list.slice(size);
            if (EFL.setBench) EFL.setBench(team, extra);
            subs.push(extra);
        });
        localStorage.setItem('playerNames', JSON.stringify(builder.playerNames));
        builder.loadFormation();
        EFL.emit('change', 'split');
        return subs;
    }

    function renderResult(box, teams) {
        const name = team => (EFL.teamName ? EFL.teamName(team) : (team === 'my-team' ? 'Home' : 'Away'));
        const rated = teams.flat().some(p => p.rated);
        box.innerHTML = teams.map((team, i) => `
            <div class="split-col">
                <div class="split-head">${name(i ? 'opp-team' : 'my-team')}
                    <span>${team.length} players${rated ? ` · skill ${total(team)}` : ''}</span></div>
                <ol>${team.map(p => `<li>${p.name}${p.gk ? ' <em>GK</em>' : ''}${rated ? ` <small>${'★'.repeat(p.skill)}</small>` : ''}</li>`).join('')}</ol>
            </div>`).join('');
    }

    function openPanel() {
        const hasAway = spots('opp-team') > 0;
        if (!hasAway) { showToast('Team splitter needs two teams on the pitch.'); return; }
        let result = null;
        EFL.openPanel({
            title: 'Split teams',
            build(body, close) {
                body.innerHTML = `
                    <p class="efl-hint">Paste who's playing, one per line. Add a skill from 1 to 5 to balance teams (<b>Sam 4</b> or <b>Sam ****</b>) and <b>GK</b> for keepers.</p>
                    <textarea id="spList" spellcheck="false" placeholder="1. Sam 4&#10;2. Alex GK&#10;3. Priya ****&#10;4. Jo"></textarea>
                    <div class="efl-hint" id="spCount"></div>
                    <div class="split-result" id="spResult" hidden></div>
                    <div class="efl-panel-actions">
                        <button type="button" class="efl-btn" id="spShuffle" hidden>Reshuffle</button>
                        <button type="button" class="efl-btn efl-btn--primary" id="spSplit">Split</button>
                        <button type="button" class="efl-btn efl-btn--primary" id="spUse" hidden>Use these teams</button>
                    </div>`;
                const area = body.querySelector('#spList');
                const count = body.querySelector('#spCount');
                const out = body.querySelector('#spResult');
                area.value = localStorage.getItem(LIST_KEY) || '';
                const perTeam = spots('my-team');
                const updateCount = () => {
                    const n = EFL.parseSquad(area.value).length;
                    count.textContent = n ? `${n} players · ${perTeam} a side on the pitch${n > perTeam * 2 ? `, ${n - perTeam * 2} subs` : ''}` : '';
                };
                updateCount();
                area.addEventListener('input', updateCount);

                const split = () => {
                    const players = EFL.parseSquad(area.value);
                    if (players.length < 2) { showToast('Add at least two names.'); return; }
                    localStorage.setItem(LIST_KEY, area.value);
                    result = EFL.splitSquad(players);
                    renderResult(out, result);
                    out.hidden = false;
                    body.querySelector('#spShuffle').hidden = false;
                    body.querySelector('#spUse').hidden = false;
                    body.querySelector('#spSplit').hidden = true;
                    EFL.track('split_teams', { players: players.length });
                };
                body.querySelector('#spSplit').addEventListener('click', split);
                body.querySelector('#spShuffle').addEventListener('click', split);
                area.addEventListener('input', () => {
                    if (!result) return;
                    body.querySelector('#spSplit').hidden = false;
                    body.querySelector('#spUse').hidden = true;
                });
                body.querySelector('#spUse').addEventListener('click', () => {
                    const subs = applyTeams(result);
                    close();
                    const extra = subs[0].length + subs[1].length;
                    showToast(extra && !EFL.setBench
                        ? `Teams set. ${extra} extra player${extra > 1 ? 's' : ''} didn't fit the pitch.`
                        : 'Teams set. Share when ready.');
                });
            }
        });
    }

    EFL.on('ready', () => {
        EFL.css('css/feature-team-splitter.css?v=1795660000');
        const btn = EFL.addTool({ id: 'splitTeamsBtn', label: 'Split teams', title: 'Paste who is playing and get two fair teams', order: 10, onClick: openPanel });
        btn?.classList.add('tool-btn--primary');
    });
})();
