// Feature: better sharing.
// - Share sheet for links on any touch device that supports it (not only
//   phones whose user agent says "Mobi"), copy with a toast instead of alert().
// - "Copy as text": the lineup as a plain list, ready to paste in WhatsApp.

(function () {
    const isTouch = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    async function copyText(text, message) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
        }
        showToast(message);
    }

    FormationBuilder.prototype.shareURL = async function (url) {
        if (navigator.share && isTouch()) {
            try {
                await navigator.share({ title: document.title, text: SHARE_MESSAGE.trim(), url });
                return;
            } catch (e) {
                if (e && e.name === 'AbortError') return;
            }
        }
        copyText(url, 'Link copied. Paste it in your group chat.');
    };

    FormationBuilder.prototype.copyToClipboard = function (url) {
        copyText(url, 'Link copied. Paste it in your group chat.');
    };

    function formationLabel(selectId) {
        const select = document.getElementById(selectId);
        return select ? select.options[select.selectedIndex].text : '';
    }

    function teamLines(builder, team) {
        const names = [...document.querySelectorAll(`#field .player.${team}`)]
            .sort((a, b) => a.dataset.index - b.dataset.index)
            .map((el, i) => `${i + 1}. ${el.querySelector('.player-name').textContent.trim() || '-'}`);
        const bench = EFL.benchNames ? EFL.benchNames(team) : [];
        if (bench.length) names.push(`Subs: ${bench.join(', ')}`);
        return names;
    }

    /** The lineup as plain text (used by "Copy as text"). */
    EFL.lineupText = function (builder = window.formationBuilder) {
        const name = team => (EFL.teamName ? EFL.teamName(team) : (team === 'my-team' ? 'Home' : 'Away'));
        const lines = [`⚽ ${builder.config.gameType} lineup`, ''];
        lines.push(`🔵 ${name('my-team').toUpperCase()} (${formationLabel('myTeamFormation')})`);
        lines.push(...teamLines(builder, 'my-team'), '');
        if (document.querySelector('#field .opp-team')) {
            lines.push(`🔴 ${name('opp-team').toUpperCase()} (${formationLabel('awayTeamFormation')})`);
            lines.push(...teamLines(builder, 'opp-team'), '');
        }
        lines.push(`View or edit: ${builder.buildShareUrl()}`);
        return lines.join('\n');
    };

    EFL.on('ready', () => {
        EFL.addTool({
            id: 'copyTextBtn',
            label: 'Copy as text',
            title: 'Copy the lineup as a text list for WhatsApp or email',
            order: 80,
            onClick: () => {
                EFL.track('copy_text');
                copyText(EFL.lineupText(), 'Lineup copied as text.');
            }
        });
    });
})();
