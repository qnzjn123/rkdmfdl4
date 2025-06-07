// Service Worker - 캐싱 및 오프라인 지원
const CACHE_NAME = 'imgaeul-blog-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/App.vue',
  '/og-image.svg',
  '/favicon.svg'
]

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시가 열렸습니다')
        return cache.addAll(urlsToCache)
      })
      .catch(err => console.log('캐시 설치 중 오류:', err))
  )
})

// Fetch 이벤트 (네트워크 요청 가로채기)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 발견되면 캐시된 버전 반환
        if (response) {
          return response
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then(response => {
            // 응답이 유효하지 않으면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // 네트워크도 실패하면 오프라인 페이지 반환
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})

// 활성화 이벤트 (오래된 캐시 정리)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
}) 