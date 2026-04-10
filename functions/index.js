const { onCall, HttpsError } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const ALLOWED_CREATE_ROLES = new Set(['TEACHER', 'RED_STAR'])

const REGION = process.env.FUNCTIONS_REGION || 'asia-southeast1'

async function assertCallerIsAdmin(uid) {
  const snap = await db.doc(`profiles/${uid}`).get()
  const d = snap.data()
  if (!snap.exists || d.role !== 'ADMIN' || d.is_deleted === true || d.is_active === false) {
    throw new HttpsError('permission-denied', 'Chỉ quản trị viên được thực hiện.')
  }
}

exports.adminCreateUser = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập.')
  }
  await assertCallerIsAdmin(request.auth.uid)

  const { email, password, full_name, phone, role, unit } = request.data || {}
  const em = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const pw = typeof password === 'string' ? password : ''
  const name = typeof full_name === 'string' ? full_name.trim() : ''

  if (!em || !em.includes('@')) {
    throw new HttpsError('invalid-argument', 'Email không hợp lệ.')
  }
  if (pw.length < 6) {
    throw new HttpsError('invalid-argument', 'Mật khẩu tạm cần ít nhất 6 ký tự.')
  }
  if (!name) {
    throw new HttpsError('invalid-argument', 'Nhập họ tên.')
  }
  if (!ALLOWED_CREATE_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', 'Vai trò không hợp lệ (chỉ tạo GVBM, GVCN hoặc Sao Đỏ).')
  }

  try {
    const userRecord = await auth.createUser({
      email: em,
      password: pw,
      displayName: name,
      emailVerified: false,
      disabled: false,
    })

    await db.doc(`profiles/${userRecord.uid}`).set({
      email: em,
      full_name: name,
      phone: phone ? String(phone).trim() : null,
      role,
      unit: unit ? String(unit).trim() : '',
      is_active: true,
      is_deleted: false,
      avatar_url: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login_at: null,
    })

    return { uid: userRecord.uid }
  } catch (e) {
    logger.error('adminCreateUser', e)
    if (e.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Email đã được sử dụng.')
    }
    throw new HttpsError('internal', e.message || 'Tạo tài khoản thất bại.')
  }
})

exports.adminSetAuthDisabled = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập.')
  }
  await assertCallerIsAdmin(request.auth.uid)

  const { uid, disabled } = request.data || {}
  if (!uid || typeof uid !== 'string') {
    throw new HttpsError('invalid-argument', 'Thiếu uid.')
  }
  if (typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Thiếu trạng thái disabled.')
  }
  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'Không thể khóa tài khoản của chính bạn.')
  }

  try {
    await auth.updateUser(uid, { disabled })
    return { ok: true }
  } catch (e) {
    logger.error('adminSetAuthDisabled', e)
    throw new HttpsError('internal', e.message || 'Cập nhật Auth thất bại.')
  }
})
