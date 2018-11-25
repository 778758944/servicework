const CACHE_NAME = "MY-SITE-CACHE-V7";
const urlsToCache = [
    "./girl.jpg",
];



self.addEventListener("install", (event) => {
    console.log("install event: ", event);
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        console.log("Cache opened");
        return cache.addAll(urlsToCache);
    }))
});

self.addEventListener("fetch", (event) => {
    console.log("fetch event:", event);
    if (event.request.method === 'GET') {
        /*
        const fetchRequest = event.request.clone();
        const requestPromise = fetch(fetchRequest).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        });
        */
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    /*
                    const fetchRequest = event.request.clone();
                    fetch(fetchRequest).then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return;
                        }
    
                        const responseToCache = response.clone();
    
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    });
                    */
                    return response;
                }

                console.log("add new cache:", event.request);
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                });
                // return fetch(event.request);
            }).catch(err => {
                console.log(err);
            })
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});

self.addEventListener("activate", (event) => {
    // will be called when update the sw.js  
    console.log("activate event: ", event);
    event.waitUntil(caches.keys().then((cacheNames) => {
        console.log('cacheNames', cacheNames);
        return Promise.all(cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
        }))
    }))
});