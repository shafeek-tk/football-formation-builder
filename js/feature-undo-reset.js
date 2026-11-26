// Feature: undo, redo and reset.
// Every change (names, swaps, formations, and anything features add to the
// share-link state) is recorded, so mistakes are one tap away from fixed.
// Keyboard: Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z or Ctrl+Y to redo.

(function () {
    const LIMIT = 50;
    let history = [];
    let index = -1;
    let applying = false;

    const snapshot = () => JSON.stringify(window.formationBuilder.getState());

    function record() {
        if (applying || !window.formationBuilder) return;
        const snap = snapshot();
        if (history[index] === snap) return;
        history = history.slice(0, index + 1);
        history.push(snap);
        if (history.length > LIMIT) history.shift();
        index = history.length - 1;
        updateButtons();
    }

    function go(to) {
        if (to < 0 || to >= history.length) return;
        index = to;
        applying = true;
        try {
            window.formationBuilder.applyState(JSON.parse(history[index]));
        } finally {
            applying = false;
        }
        updateButtons();
    }

    function undo() { go(index - 1); EFL.track('undo'); }
    function redo() { go(index + 1); EFL.track('redo'); }

    function reset() {
        const builder = window.formationBuilder;
        const first = id => document.getElementById(id)?.options[0]?.value;
        EFL.emit('reset');
        applying = true;
        try {
            builder.applyState({ h: first('myTeamFormation'), a: builder.config.defaultAwayFormationKey || first('awayTeamFormation'), n: {} });
        } finally {
            applying = false;
        }
        record();
        EFL.track('reset');
        showToast('Lineup reset. Tap Undo to bring it back.');
    }

    function updateButtons() {
        const set = (id, disabled) => { const b = document.getElementById(id); if (b) b.disabled = disabled; };
        set('undoBtn', index <= 0);
        set('redoBtn', index >= history.length - 1);
    }

    EFL.on('change', () => setTimeout(record, 0));

    EFL.on('ready', () => {
        EFL.css('css/feature-undo-reset.css?v=1795660000');
        EFL.addTool({ id: 'undoBtn', label: '↶ Undo', title: 'Undo (Ctrl+Z)', order: 90, onClick: undo });
        EFL.addTool({ id: 'redoBtn', label: '↷ Redo', title: 'Redo (Ctrl+Shift+Z)', order: 91, onClick: redo });
        EFL.addTool({ id: 'resetBtn', label: 'Reset', title: 'Back to the default lineup', order: 92, onClick: reset });
        ['myTeamFormation', 'awayTeamFormation'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => setTimeout(record, 0));
        });
        record();
    });

    document.addEventListener('keydown', e => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); }
    });

    EFL.history = () => ({ size: history.length, index });
})();
