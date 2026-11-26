// Service worker: makes the site installable and usable offline.
// Network first (so a deploy shows up straight away), cache as the fallback.
const CACHE = 'efl-v1';
const CORE = [
    './', 'index.html', '5s.html', '6s.html', '7s.html', '8s.html', '9s.html', '10s.html',
    'css/app-styles.css', 'css/pitch-styles.css',
    'js/vendor/lz-string-1.5.0.min.js', 'js/pitch-common.js', 'js/formations.js',
    'js/formation-builder.js', 'js/app.js', 'js/common-mode-toggle.js', 'js/common-footer.js',
    'manifest.webmanifest', 'icons/icon-192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;
    const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
    if (!sameOrigin && !font) return;

    event.respondWith(
        fetch(req)
            .then(res => {
                if (res.ok || res.type === 'opaque') {
                    const copy = res.clone();
                    caches.open(CACHE).then(cache => cache.put(req, copy));
                }
                return res;
            })
            .catch(() => caches.match(req, { ignoreSearch: sameOrigin }).then(hit => hit || caches.match('index.html')))
    );
});
