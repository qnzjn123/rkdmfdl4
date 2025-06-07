// utils.js - 대용량 파일 처리를 위한 유틸리티
import imageCompression from 'browser-image-compression'
import { storage } from './firebase.js'
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

// 이미지 압축 설정 - 대용량 이미지 최적화
const compressionOptions = {
  maxSizeMB: 5, // 최대 5MB로 압축
  maxWidthOrHeight: 1920, // 최대 1920px
  useWebWorker: true, // 웹워커 사용으로 메인 스레드 차단 방지
  fileType: 'image/jpeg', // JPEG로 변환 (용량 절약)
  initialQuality: 0.8 // 초기 품질 80%
}

// 고화질 이미지를 위한 압축 설정
const highQualityOptions = {
  maxSizeMB: 10, // 최대 10MB
  maxWidthOrHeight: 2560, // 최대 2560px
  useWebWorker: true,
  initialQuality: 0.9 // 초기 품질 90%
}

// 썸네일용 압축 설정
const thumbnailOptions = {
  maxSizeMB: 0.5, // 최대 500KB
  maxWidthOrHeight: 400, // 최대 400px
  useWebWorker: true,
  fileType: 'image/webp', // WebP 형식으로 더 작은 용량
  initialQuality: 0.7
}

// 이미지 압축 함수
export async function compressImage(file, quality = 'standard') {
  try {
    let options = compressionOptions
    
    if (quality === 'high') {
      options = highQualityOptions
    } else if (quality === 'thumbnail') {
      options = thumbnailOptions
    }
    
    const compressedFile = await imageCompression(file, options)
    console.log('압축 완료:', {
      원본크기: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      압축후크기: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      압축률: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
    })
    
    return compressedFile
  } catch (error) {
    console.error('이미지 압축 오류:', error)
    return file // 압축 실패시 원본 반환
  }
}

// 대용량 파일 업로드 (진행률 표시)
export async function uploadLargeFile(file, path, onProgress) {
  try {
    // 이미지 파일인 경우 압축 진행
    let fileToUpload = file
    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file)
    }
    
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload)
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // 업로드 진행률 계산
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
          console.log(`업로드 진행률: ${progress.toFixed(1)}%`)
        },
        (error) => {
          console.error('업로드 오류:', error)
          reject(error)
        },
        async () => {
          // 업로드 완료
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('파일 업로드 오류:', error)
    throw error
  }
}

// 다중 파일 업로드 (병렬 처리)
export async function uploadMultipleFiles(files, basePath, onProgress) {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`
      return uploadLargeFile(file, path, (progress) => {
        if (onProgress) {
          onProgress(index, progress)
        }
      })
    })
    
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('다중 파일 업로드 오류:', error)
    throw error
  }
}

// 파일 크기 검증
export function validateFileSize(file, maxSizeMB = 50) {
  const maxSize = maxSizeMB * 1024 * 1024 // MB를 바이트로 변환
  return file.size <= maxSize
}

// 파일 타입 검증
export function validateFileType(file, allowedTypes = ['image/*', 'video/*']) {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

// 이미지 미리보기 생성 (메모리 효율적)
export function createImagePreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// 메모리 정리 함수
export function cleanupImagePreview(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

// 대용량 데이터 페이지네이션 헬퍼
export function createPagination(totalItems, itemsPerPage = 20) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  return {
    totalPages,
    itemsPerPage,
    getPageItems: (items, currentPage) => {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return items.slice(startIndex, endIndex)
    },
    getPageInfo: (currentPage) => ({
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      startItem: (currentPage - 1) * itemsPerPage + 1,
      endItem: Math.min(currentPage * itemsPerPage, totalItems)
    })
  }
}

// 가상 스크롤링을 위한 아이템 높이 계산
export function calculateItemHeight(item) {
  // 기본 높이 + 이미지 높이 + 텍스트 길이에 따른 높이
  let height = 100 // 기본 높이
  
  if (item.images && item.images.length > 0) {
    height += 200 * Math.ceil(item.images.length / 3) // 이미지 행 수에 따른 높이
  }
  
  if (item.content) {
    height += Math.ceil(item.content.length / 50) * 20 // 텍스트 길이에 따른 높이
  }
  
  return height
} 