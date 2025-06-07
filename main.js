import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'

// 대용량 처리를 위한 플러그인들 import
import VueLazyLoad from 'vue-lazyload'
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// Vue 앱 생성 및 성능 최적화
const app = createApp(App)

// 라우터 사용
app.use(router)

// 지연 로딩 플러그인 설정 - 대용량 이미지 최적화
app.use(VueLazyLoad, {
  preLoad: 1.3, // 화면 밖 30% 지점에서 미리 로딩
  error: '/error-placeholder.jpg', // 오류시 대체 이미지
  loading: '/loading-placeholder.jpg', // 로딩중 대체 이미지
  attempt: 3, // 재시도 횟수
  listenEvents: ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend'],
  throttleWait: 200, // 스크롤 이벤트 쓰로틀링
  observer: true, // Intersection Observer 사용
  observerOptions: {
    rootMargin: '50px', // 50px 여백에서 로딩 시작
    threshold: 0.1
  }
})

// 가상 스크롤링 컴포넌트 글로벌 등록
app.component('RecycleScroller', RecycleScroller)
app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

// 에러 핸들링
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 에러:', err, info)
  
  // 메모리 관련 오류 감지
  if (err.message.includes('out of memory') || err.message.includes('Maximum call stack')) {
    console.warn('메모리 부족 감지 - 가상 스크롤링 권장')
  }
}

// 성능 추적 (개발 환경에서만)
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 라우터 사용 및 앱 마운트
app.mount('#app')

// Service Worker 등록 (프로덕션 환경에서만)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW 등록 성공:', registration.scope)
      })
      .catch(registrationError => {
        console.log('SW 등록 실패:', registrationError)
      })
  })
} 