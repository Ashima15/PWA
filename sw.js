const cacheName = 'site-cache-v7';
const dynamicCacheName = 'site-dynamic-v5'
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/materialize.min.js',
    '/js/ui.js',
    '/css/materialize.min.css',
    '/css/styles.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v70/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    '/pages/fallback.html'
]

// Limit Cache Size
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}

// Install event
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(assets);
        })
    );
    // console.log('Service worker installed')
})

// Activate event
self.addEventListener('activate', evt => {
    // console.log('Service worker activate')
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== cacheName && key !== dynamicCacheName)
                    .map(key => caches.delete(key))
            )
        })
    )
})

// Fetch event
self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCacheName, 15)
                        return fetchRes;
                    })
                });
            }).catch(() => {
                if(evt.request.url.indexOf('.html') > -1) {
                    return caches.match('/pages/fallback.html');
                }
            })
        )
    }
})