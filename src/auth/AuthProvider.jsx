import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db, fetchProfileFromFirestore, isFirebaseConfigured } from '../lib/firebaseClient.js'
import { isTeacherRole } from '../lib/organizationFirestore.js'
import { AuthContext } from './context.js'

async function touchLastLogin(uid) {
  if (!db) return
  try {
    await updateDoc(doc(db, 'profiles', uid), { last_login_at: serverTimestamp() })
  } catch {
    /* bỏ qua lỗi mạng / rules */
  }
}

function requireAdminRoleEnabled() {
  return import.meta.env.VITE_REQUIRE_ADMIN_ROLE !== 'false'
}

function mapAppUser(fbUser) {
  if (!fbUser) return null
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email,
    emailVerified: fbUser.emailVerified,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
  }
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const session = useMemo(
    () => (firebaseUser ? { user: mapAppUser(firebaseUser) } : null),
    [firebaseUser],
  )

  const refreshProfile = useCallback(async (userId) => {
    if (!userId || !isFirebaseConfigured() || !auth) {
      setProfile(null)
      return null
    }
    try {
      const p = await fetchProfileFromFirestore(userId)
      setProfile(p)
      return p
    } catch {
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (cancelled) return
      setFirebaseUser(u)
      if (u) await refreshProfile(u.uid)
      else setProfile(null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [refreshProfile])

  const signIn = useCallback(async (email, password) => {
    if (!isFirebaseConfigured() || !auth) {
      return {
        error: {
          message:
            'Chưa cấu hình Firebase (VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, APP_ID).',
        },
      }
    }
    const trimmed = email.trim()
    let cred
    try {
      cred = await signInWithEmailAndPassword(auth, trimmed, password)
    } catch (e) {
      return { error: { message: e.message ?? 'Đăng nhập thất bại.' } }
    }

    let p = null
    try {
      p = await fetchProfileFromFirestore(cred.user.uid)
    } catch (e) {
      await firebaseSignOut(auth)
      return { error: { message: e.message ?? 'Không đọc được hồ sơ (Firestore profiles).' } }
    }

    if (!p) {
      await firebaseSignOut(auth)
      return { error: { message: 'Tài khoản chưa có hồ sơ trong hệ thống. Liên hệ quản trị.' } }
    }
    if (p.is_deleted) {
      await firebaseSignOut(auth)
      return { error: { message: 'Tài khoản đã bị vô hiệu hóa.' } }
    }
    if (!p.is_active) {
      await firebaseSignOut(auth)
      return { error: { message: 'Tài khoản đang bị khóa.' } }
    }
    if (
      requireAdminRoleEnabled() &&
      p.role !== 'ADMIN' &&
      !isTeacherRole(p.role) &&
      p.role !== 'RED_STAR'
    ) {
      await firebaseSignOut(auth)
      return {
        error: {
          message:
            'Chỉ tài khoản Quản trị (ADMIN), Giáo viên (TEACHER / GVCN / GVBM) hoặc Đội Sao Đỏ (RED_STAR) được đăng nhập.',
        },
      }
    }

    setProfile(p)
    touchLastLogin(cred.user.uid)
    return { error: null, profile: p }
  }, [])

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const resetPasswordForEmail = useCallback(async (email) => {
    if (!isFirebaseConfigured() || !auth) {
      return { error: { message: 'Chưa cấu hình Firebase.' } }
    }
    const continueUrl = `${window.location.origin}/auth/update-password`
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: continueUrl,
        handleCodeInApp: true,
      })
      return { error: null }
    } catch (e) {
      return { error: { message: e.message ?? 'Không gửi được email đặt lại mật khẩu.' } }
    }
  }, [])

  const changePasswordWithReauth = useCallback(async (oldPassword, newPassword) => {
    if (!isFirebaseConfigured() || !auth) {
      return { error: { message: 'Chưa cấu hình Firebase.' } }
    }
    const user = auth.currentUser
    const email = user?.email
    if (!user || !email) {
      return { error: { message: 'Không xác định được phiên đăng nhập.' } }
    }

    try {
      const credential = EmailAuthProvider.credential(email, oldPassword)
      await reauthenticateWithCredential(user, credential)
    } catch {
      return { error: { message: 'Mật khẩu hiện tại không đúng.' } }
    }

    try {
      await updatePassword(user, newPassword)
    } catch (e) {
      return { error: { message: e.message ?? 'Không đổi được mật khẩu.' } }
    }
    return { error: null }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signOut,
      resetPasswordForEmail,
      changePasswordWithReauth,
      refreshProfile,
      isConfigured: isFirebaseConfigured(),
      requireAdminRole: requireAdminRoleEnabled(),
    }),
    [
      session,
      profile,
      loading,
      signIn,
      signOut,
      resetPasswordForEmail,
      changePasswordWithReauth,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
