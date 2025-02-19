// service-worker.ts
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('launch', (event) => {
    event.preventDefault();

    const url = event.launchData?.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window' })
            .then(async (windowClientsReadonly) => {
                const windowClients = [...windowClientsReadonly];

                if (windowClients.length > 0) {
                    const client = windowClients[0];
                    await client.focus();
                    if (client.url !== url) {
                        return client.navigate(url);
                    }
                } else {
                    return clients.openWindow(url);
                }
            }),
    );
});

// // Type definitions
// interface LaunchData {
//     url?: string;
// }

// interface WindowClient extends Client {
//     // focus: () => Promise<void>;
//     // navigate: (url: string) => Promise<void>;
//     url: string;
// }

// interface ExtendableEvent extends Event {
//     launchData?: LaunchData;
//     waitUntil(promise: Promise<any>): void;
// }

// // Example fetch event listener (Optional - Add if needed)
// self.addEventListener('fetch', (event: FetchEvent) => {
//     event.respondWith(
//         caches.match(event.request).then((response) => {
//             if (response) {
//                 return response;
//             }

//             return fetch(event.request).then((networkResponse) => {
//                 // Cache the network response (important for offline)
//                 const responseClone = networkResponse.clone(); // Clone before caching
//                 caches.open('my-cache').then((cache) => {
//                     return cache.put(event.request, responseClone);
//                 });
//                 return networkResponse;
//             });
//         }),
//     );

//     // waitUntil is not strictly required in the fetch event listener
//     // if you are already returning a promise from respondWith
//     // However, it's good practice to use it if you have other async operations
//     // that need to complete before the service worker terminates.
//     // In the example above, caching is done in respondWith using promises.
//     // So, waitUntil is not strictly required.
//     // But if you have additional tasks you want to do after respondWith, you could use it.
//     // event.waitUntil( // Example: If you have more async ops after respondWith
//     //   // ... some other asynchronous operation
//     // );
// });

// interface FetchEvent extends Event {
//     request: Request;
//     respondWith(r: Response | Promise<Response>): void;
// }
