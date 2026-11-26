// Feature: enter all names at once.
// One text box per team, one name per line (a list pasted from WhatsApp
// works: numbers, bullets and ticks are stripped). Also "Clear all names".

(function () {
    /** Turn pasted text into clean names. */
    EFL.parseNames = function (text) {
        return text.split(/\r?\n/)
            .map(line => line
                .replace(/^\s*(\d+\s*[.)\-:]|[-*•·–—>]|\[[ xX]?\])\s*/, '')
                .replace(/[✅✔☑️]/g, '')
                .trim())
            .filter(Boolean);
    };

    function teamSize(team) {
        return document.querySelectorAll(`#field .player.${team}`).length;
    }

    function currentNames(builder, team) {
        const names = [];
        for (let i = 0; i < teamSize(team); i++) names.push(builder.getPlayerName(team, i));
        return names;
    }

    function setTeamNames(builder, team, names) {
        const size = teamSize(team);
        for (let i = 0; i < size; i++) {
            builder.playerNames[`${team}_${i}`] = (names[i] || '').toUpperCase();
        }
        const extra = names.slice(size);
        if (extra.length && EFL.setBench) EFL.setBench(team, extra);
        return extra;
    }

    function openPanel() {
        const builder = window.formationBuilder;
        const hasAway = teamSize('opp-team') > 0;
        EFL.openPanel({
            title: 'Enter names',
            build(body, close) {
                body.innerHTML = `
                    <p class="efl-hint">One name per line, in shirt-number order. You can paste a list straight from WhatsApp.</p>
                    <label for="bnHome">Home (${teamSize('my-team')} players)</label>
                    <textarea id="bnHome" spellcheck="false"></textarea>
                    ${hasAway ? `<label for="bnAway">Away (${teamSize('opp-team')} players)</label>
                    <textarea id="bnAway" spellcheck="false"></textarea>` : ''}
                    <div class="efl-panel-actions">
                        <button type="button" class="efl-btn" id="bnClear">Clear all names</button>
                        <button type="button" class="efl-btn efl-btn--primary" id="bnApply">Apply</button>
                    </div>`;
                body.querySelector('#bnHome').value = currentNames(builder, 'my-team').join('\n');
                if (hasAway) body.querySelector('#bnAway').value = currentNames(builder, 'opp-team').join('\n');

                body.querySelector('#bnClear').addEventListener('click', () => {
                    body.querySelectorAll('textarea').forEach(t => { t.value = ''; });
                    body.querySelector('textarea').focus();
                });
                body.querySelector('#bnApply').addEventListener('click', () => {
                    let extra = setTeamNames(builder, 'my-team', EFL.parseNames(body.querySelector('#bnHome').value));
                    if (hasAway) extra = extra.concat(setTeamNames(builder, 'opp-team', EFL.parseNames(body.querySelector('#bnAway').value)));
                    localStorage.setItem('playerNames', JSON.stringify(builder.playerNames));
                    builder.loadFormation();
                    EFL.emit('change', 'names');
                    EFL.track('bulk_names');
                    close();
                    if (extra.length && !EFL.setBench) {
                        showToast(`${extra.length} extra name${extra.length > 1 ? 's' : ''} didn't fit this formation.`);
                    } else {
                        showToast('Names updated.');
                    }
                });
            }
        });
    }

    EFL.on('ready', () => {
        EFL.addTool({ id: 'bulkNamesBtn', label: 'Enter names', title: 'Type or paste all names at once', order: 20, onClick: openPanel });
    });
})();
