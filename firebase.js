// Firebase 설정
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase 설정 (실제 사용시에는 환경변수로 관리하세요)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project-id",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 데이터베이스 초기화
export const db = getFirestore(app)

// 인증 초기화
export const auth = getAuth(app)

// Storage 초기화 - 대용량 파일 업로드 지원
export const storage = getStorage(app)

// 개발 환경에서는 로컬 에뮬레이터 사용 (선택사항) - 현재는 비활성화
// 실제 Firebase 프로젝트를 사용하거나 에뮬레이터를 설정한 후 활성화하세요
/*
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
  } catch (error) {
    console.log('Firebase emulators already connected')
  }
}
*/

export default app 