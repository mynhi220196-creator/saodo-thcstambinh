import { initializeApp, getApps } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  signOut,
} from 'firebase/auth'
import { firebaseWebConfig, isFirebaseConfigured } from './firebaseClient.js'

const SECONDARY_APP_NAME = 'SaodoSecondaryRegister'

let secondaryAuthSingleton = null

/**
 * App Auth thứ hai (in-memory) để gọi createUserWithEmailAndPassword mà không đá phiên admin hiện tại.
 */
export function getSecondaryRegisterAuth() {
  if (!isFirebaseConfigured()) return null
  if (secondaryAuthSingleton) return secondaryAuthSingleton

  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME)
  const secondaryApp = existing ?? initializeApp(firebaseWebConfig, SECONDARY_APP_NAME)

  try {
    secondaryAuthSingleton = initializeAuth(secondaryApp, {
      persistence: inMemoryPersistence,
    })
  } catch (e) {
    if (e?.code === 'auth/already-initialized') {
      secondaryAuthSingleton = getAuth(secondaryApp)
    } else {
      throw e
    }
  }
  return secondaryAuthSingleton
}

/**
 * Tạo user Auth mới; ghi Firestore là bước riêng. Nếu ghi Firestore thất bại, xóa user Auth vừa tạo.
 */
export async function createAuthUserWithSecondaryApp(email, password) {
  const sec = getSecondaryRegisterAuth()
  if (!sec) throw new Error('Chưa cấu hình Firebase.')

  const cred = await createUserWithEmailAndPassword(sec, email.trim().toLowerCase(), password)
  const user = cred.user

  async function cleanup() {
    try {
      await deleteUser(user)
    } catch {
      /* bỏ qua */
    }
    try {
      await signOut(sec)
    } catch {
      /* bỏ qua */
    }
  }

  return {
    uid: user.uid,
    async disposeWithoutKeepingUser() {
      await cleanup()
    },
    async finishSuccess() {
      await signOut(sec)
    },
  }
}
