import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

export const firebaseWebConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

const firebaseConfig = firebaseWebConfig

function getApp() {
  if (getApps().length) return getApps()[0]
  return initializeApp(firebaseConfig)
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

export const app = isFirebaseConfigured() ? getApp() : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

/**
 * Hồ sơ trong Firestore: collection `profiles`, document id = uid.
 * Các field: full_name, phone?, avatar_url?, role, is_active (mặc định true), is_deleted (mặc định false).
 */
export async function fetchProfileFromFirestore(userId) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const ref = doc(db, 'profiles', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: userId,
    email: d.email ?? null,
    full_name: d.full_name ?? '',
    phone: d.phone ?? null,
    avatar_url: d.avatar_url ?? null,
    role: d.role ?? 'RED_STAR',
    is_active: d.is_active !== false,
    is_deleted: d.is_deleted === true,
    unit: d.unit ?? '',
  }
}
