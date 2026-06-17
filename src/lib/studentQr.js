import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebaseClient.js'

/**
 * Mã QR trên thẻ học sinh chỉ chứa Firestore doc id của document trong
 * collection `students`, kèm tiền tố không gian tên để tránh nhầm với QR khác.
 *
 * Định dạng:  SAODO:STU:<docId>
 *
 * Lý do dùng doc id (thay vì student_code): doc id là duy nhất toàn hệ thống,
 * còn student_code chỉ duy nhất trong từng lớp. Trên thẻ cũng không lộ tên/lớp.
 */
const QR_PREFIX = 'SAODO:STU:'

/** Tạo chuỗi payload để in thành QR cho một học sinh. */
export function encodeStudentQr(studentId) {
  const id = String(studentId ?? '').trim()
  if (!id) return ''
  return `${QR_PREFIX}${id}`
}

/**
 * Giải mã chuỗi quét được thành doc id học sinh.
 * Chấp nhận cả chuỗi có tiền tố (SAODO:STU:abc) lẫn doc id thuần (abc) để linh hoạt,
 * nhưng từ chối URL/định dạng lạ rõ ràng.
 * Trả về doc id hoặc null nếu không hợp lệ.
 */
export function decodeStudentQr(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return null
  if (raw.startsWith(QR_PREFIX)) {
    const id = raw.slice(QR_PREFIX.length).trim()
    return id || null
  }
  // Chuỗi thuần không có khoảng trắng, không phải URL -> coi là doc id.
  if (!/[\s/:?#]/.test(raw) && raw.length >= 6 && raw.length <= 64) {
    return raw
  }
  return null
}

/**
 * Tra cứu học sinh + lớp theo chuỗi QR quét được.
 * Trả về { student, classMeta } trong đó:
 *   student  = { id, full_name, student_code, class_id, ... }
 *   classMeta = { id, code, school_year, ... } | null
 * Ném lỗi với thông báo tiếng Việt nếu không tìm thấy hoặc đã xóa.
 */
export async function lookupStudentByQr(text) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const studentId = decodeStudentQr(text)
  if (!studentId) {
    throw new Error('Mã QR không hợp lệ hoặc không thuộc hệ thống Sao Đỏ.')
  }

  const sSnap = await getDoc(doc(db, 'students', studentId))
  if (!sSnap.exists()) {
    throw new Error('Không tìm thấy học sinh ứng với mã QR này.')
  }
  const student = { id: sSnap.id, ...sSnap.data() }
  if (student.is_deleted === true) {
    throw new Error('Học sinh này đã bị xóa khỏi hệ thống.')
  }
  if (student.is_active === false) {
    throw new Error('Học sinh này đang ở trạng thái ngừng hoạt động.')
  }

  let classMeta = null
  if (student.class_id) {
    const cSnap = await getDoc(doc(db, 'classes', student.class_id))
    if (cSnap.exists()) {
      classMeta = { id: cSnap.id, ...cSnap.data() }
    }
  }
  if (!classMeta) {
    throw new Error('Học sinh chưa được gán vào lớp đang hoạt động.')
  }

  return { student, classMeta }
}
