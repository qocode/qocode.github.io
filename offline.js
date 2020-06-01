const buildNumber = new URLSearchParams(self.location.search).get('v')


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(buildNumber).then((cache) => {
      return cache.addAll([
        './',
        './get-qr/',
        './contacts/',
        './partners/',
        './about/',
        `./assets/bundle.css?v=${buildNumber}`,
        `./assets/bundle.js?v=${buildNumber}`,
        `./assets/check-and-redirect.js?v=${buildNumber}`,
        './assets/png/favicon64.png',
        './assets/png/back.png'
      ])
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (buildNumber !== key) {
          return caches.delete(key)
        }
      }))
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (new URL(event.request.url).pathname) === '/'
      ? fetch(event.request).catch(() => {
        return caches.match(event.request)
      })
      : caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open(buildNumber).then((cache) => {
            cache.put(event.request, response.clone())

            return response
          })
        })
      })
  )
})
