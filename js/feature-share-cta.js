// Feature: "make your own" nudge for people who open a shared lineup.
// Friends who receive a link land on someone else's lineup. A small banner
// tells them they can edit it, or start a fresh one for their own team, which
// turns each shared link into a new user.

(function () {
    EFL.on('ready', builder => {
        if (!window.location.hash.startsWith('#f=')) return;
        const anchor = document.querySelector('.field-container');
        if (!anchor) return;
        EFL.css('css/feature-share-cta.css?v=1795669738');

        const bar = document.createElement('div');
        bar.className = 'share-cta';
        bar.setAttribute('role', 'note');
        bar.innerHTML = `
            <p><strong>This lineup was shared with you.</strong> Tap a name to edit it, or make one for your own team. Free, no sign-up.</p>
            <div class="share-cta-actions">
                <button type="button" class="share-cta-btn" id="makeOwnBtn">Make your own</button>
                <button type="button" class="share-cta-close" aria-label="Hide this message">×</button>
            </div>`;
        anchor.parentNode.insertBefore(bar, anchor);

        bar.querySelector('.share-cta-close').addEventListener('click', () => {
            EFL.track('shared_cta_dismiss');
            bar.remove();
        });
        bar.querySelector('#makeOwnBtn').addEventListener('click', () => {
            EFL.track('shared_cta_make_own');
            history.replaceState(null, '', window.location.pathname + window.location.search);
            const reset = document.getElementById('resetBtn');
            if (reset) {
                reset.click();
                bar.remove();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.location.href = window.location.pathname;
            }
        });
    });
})();
