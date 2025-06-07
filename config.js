// 사이트 설정
export const siteConfig = {
  // 개발 환경
  development: {
    baseUrl: 'http://localhost:3001',
    domain: 'localhost:3001'
  },
  // 프로덕션 환경 (실제 도메인으로 변경 필요)
  production: {
    baseUrl: 'https://your-domain.com',
    domain: 'your-domain.com'
  },
  
  // 사이트 메타 정보
  meta: {
    title: '임가을 블로그',
    description: '임가을의 개인 블로그입니다. 일상, 생각, 그리고 다양한 이야기를 공유합니다.',
    keywords: '임가을, 블로그, 일상, 생각, 이야기',
    author: '임가을',
    themeColor: '#FF8C42',
    ogImage: '/og-image.svg'
  },
  
  // 대용량 파일 처리 설정
  fileUpload: {
    // 파일 크기 제한 (MB)
    maxFileSizeMB: 100, // 최대 100MB까지 업로드 가능
    maxImageSizeMB: 50, // 이미지 최대 50MB
    maxVideoSizeMB: 200, // 비디오 최대 200MB
    
    // 동시 업로드 개수
    maxConcurrentUploads: 5,
    
    // 지원하는 파일 형식
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/mov'],
    allowedDocumentTypes: ['application/pdf', 'text/plain'],
    
    // 이미지 품질 설정
    imageQuality: {
      thumbnail: 0.7, // 썸네일 품질
      standard: 0.8,  // 표준 품질
      high: 0.9       // 고품질
    },
    
    // 이미지 리사이징 설정
    imageResize: {
      thumbnail: { maxWidth: 400, maxHeight: 400 },
      standard: { maxWidth: 1920, maxHeight: 1920 },
      high: { maxWidth: 2560, maxHeight: 2560 }
    }
  },
  
  // 가상 스크롤링 설정
  virtualScroll: {
    itemHeight: 200, // 기본 아이템 높이
    bufferSize: 10,  // 버퍼 사이즈
    pageSize: 20,    // 페이지당 아이템 수
    preloadPages: 2  // 미리 로드할 페이지 수
  },
  
  // 페이지네이션 설정
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // 캐시 설정
  cache: {
    // 이미지 캐시 기간 (분)
    imageCacheDuration: 60 * 24, // 24시간
    // 데이터 캐시 기간 (분)
    dataCacheDuration: 30, // 30분
    // 최대 캐시 항목 수
    maxCacheItems: 1000
  },
  
  // 성능 최적화 설정
  performance: {
    // 지연 로딩 옵션
    lazyLoading: {
      enabled: true,
      threshold: 0.1, // 10% 보일 때 로딩 시작
      rootMargin: '50px' // 50px 여백
    },
    
    // 이미지 최적화
    imageOptimization: {
      enabled: true,
      autoWebP: true, // WebP 자동 변환
      progressive: true // 프로그레시브 JPEG
    },
    
    // 메모리 관리
    memoryManagement: {
      maxCachedImages: 50, // 최대 캐시된 이미지 수
      cleanupInterval: 5 * 60 * 1000, // 5분마다 정리
      maxMemoryUsage: 100 * 1024 * 1024 // 최대 100MB 메모리 사용
    }
  }
}

// 현재 환경에 따른 설정 반환
export const getCurrentConfig = () => {
  const isDev = import.meta.env.DEV
  return isDev ? siteConfig.development : siteConfig.production
} 