import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    // 많은 사용자 동시 접속 처리
    host: true,
    cors: true,
    // 대용량 파일 업로드를 위한 설정
    hmr: {
      overlay: false
    }
  },
  build: {
    // 성능 최적화
    minify: 'terser',
    cssMinify: true,
    // 청크 사이즈 최적화 - 대용량 처리를 위해 증가
    rollupOptions: {
      output: {
        // 벤더 라이브러리와 앱 코드 분리
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          utils: ['browser-image-compression']
        },
        // 파일명에 해시 추가 (캐싱 최적화)
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // 경고 무시 (번들 사이즈) - 대용량 처리를 위해 증가
    chunkSizeWarningLimit: 5000,
    // 압축 설정
    reportCompressedSize: false,
    // 메모리 최적화
    target: 'esnext',
    sourcemap: false
  },
  // 성능 최적화
  optimizeDeps: {
    include: ['vue', 'vue-router', 'firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
    // 대용량 의존성 처리
    force: true
  },
  // 에셋 처리 - 더 많은 형식 지원
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp', '**/*.avif', '**/*.mp4', '**/*.webm'],
  // 대용량 파일 처리를 위한 설정
  define: {
    // 런타임 최적화
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }
}) 