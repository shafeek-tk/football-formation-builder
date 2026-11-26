// Feature: installable app.
// Registers the service worker (offline use) and offers "Install app" when
// the browser allows it, or Add to Home Screen steps on iPhone.

(function () {
    let deferredPrompt = null;
    const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker not registered', err));
        });
    }

    function addInstallButton(onClick) {
        if (standalone()) return;
        EFL.addTool({ id: 'installBtn', label: 'Install app', title: 'Add Easy Football Lineup to your home screen', order: 99, onClick });
    }

    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        addInstallButton(async () => {
            EFL.track('install_prompt');
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') document.getElementById('installBtn')?.remove();
            deferredPrompt = null;
        });
    });

    window.addEventListener('appinstalled', () => {
        EFL.track('app_installed');
        document.getElementById('installBtn')?.remove();
    });

    EFL.on('ready', () => {
        if (isIOS() && !standalone()) {
            addInstallButton(() => {
                EFL.track('install_ios_help');
                EFL.openPanel({
                    title: 'Add to Home Screen',
                    build(body) {
                        body.innerHTML = `
                            <ol class="efl-steps">
                                <li>Tap the <b>Share</b> button in Safari's toolbar.</li>
                                <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                                <li>Tap <b>Add</b>. The lineup builder opens like an app, even offline.</li>
                            </ol>`;
                    }
                });
            });
        }
    });
})();
