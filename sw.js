var CACHE_NAME = "my_cache";
var urlsToCache = [
    '/index.html',
    '/script.js',
    '/angular.min.js',
    '/offline.html'
];


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache : ', cache);
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET' || (event.request.url.indexOf("manifest.json") > 0)) {
        event.respondWith(fetch(event.request));
    } else {

        //HANDLE GET REQUESTS
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(response) {
                    if (response) {
                        console.log("Cache Hit for : " + event.request.url);
                    }

                    var clonedRequest = event.request.clone();
                    var fetchPromise;
                    console.log("Cache Miss. Fetching for : " + event.request.url);

                    if (event.request.url.endsWith(".json")) {
                        fetchPromise = fetch(clonedRequest).then(function(networkResponse) {
                                cache.put(clonedRequest, networkResponse.clone());
                                return networkResponse;
                            })
                            .then(function(networkResponse) {
                                networkResponse.clone().json().then(function(data) {
                                    self.clients.matchAll().then(function(all) {
                                        all.forEach(function(client) {
                                            client.postMessage({
                                                "command": "updateItems",
                                                "items": data.items
                                            });
                                        });
                                    });
                                });
                                return networkResponse;
                            })
                            .catch(serveOffline);
                    } else {
                        fetchPromise = fetch(clonedRequest).then(function(networkResponse) {
                            cache.put(clonedRequest, networkResponse.clone());
                            return networkResponse;
                        }).catch(serveOffline);
                    }

                    return response || fetchPromise;
                })
            })
        );
    }

    function serveOffline() {
        return caches.open(CACHE_NAME).then(function(cache) {
            return cache.match('offline.html').then(function(response) {

                if (response) {
                    console.log('offline.html present')
                    return response
                } else {
                    console.log('offline.html not present');
                    return new Response("Network not reachable", {
                        status: 200
                    });
                }
            });
        });
    }

});