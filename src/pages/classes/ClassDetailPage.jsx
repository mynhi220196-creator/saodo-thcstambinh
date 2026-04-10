import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { db } from '../../lib/firebaseClient.js'
import {
  buildClassDetailForUi,
  isTeacherRole,
  subscribeClassDoc,
  subscribeClasses,
  subscribeStudentsByClassId,
  updateClass,
} from '../../lib/organizationFirestore.js'
import { subscribeProfiles } from '../../lib/userProfilesFirestore.js'
import { getConductLogsForClass } from '../scoreRecords/scoreRecordMockData.js'
import ClassCreateModal from './ClassCreateModal.jsx'
import ClassDetailBreadcrumb from './ClassDetailBreadcrumb.jsx'
import ClassDetailConductPanel from './ClassDetailConductPanel.jsx'
import ClassDetailOverview from './ClassDetailOverview.jsx'
import ClassDetailTabs from './ClassDetailTabs.jsx'

export default function ClassDetailPage() {
  const { classId } = useParams()
  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [profilesRaw, setProfilesRaw] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [loadError, setLoadError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!classId) return undefined
    return subscribeClassDoc(
      classId,
      (d) => {
        setLoadError('')
        setClassData(d)
      },
      (e) => setLoadError(e?.message ?? ''),
    )
  }, [classId])

  useEffect(() => {
    if (!classId) return undefined
    return subscribeStudentsByClassId(classId, setStudents, () => {})
  }, [classId])

  useEffect(() => {
    const tid = classData?.homeroom_teacher_id
    if (!tid || !db) {
      setTeacherProfile(null)
      return undefined
    }
    let cancelled = false
    getDoc(doc(db, 'profiles', tid)).then((snap) => {
      if (cancelled) return
      setTeacherProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => {
      cancelled = true
    }
  }, [classData?.homeroom_teacher_id])

  useEffect(() => {
    const u1 = subscribeProfiles(setProfilesRaw, () => {})
    const u2 = subscribeClasses(setClassesRaw, () => {})
    return () => {
      u1()
      u2()
    }
  }, [])

  const teachers = useMemo(
    () =>
      profilesRaw
        .filter((p) => isTeacherRole(p.role) && p.is_deleted !== true && p.is_active !== false)
        .map((p) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
        }))
        .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi')),
    [profilesRaw],
  )

  const existingClassKeys = useMemo(
    () => new Set(classesRaw.map((c) => `${c.code}|${c.school_year}`)),
    [classesRaw],
  )

  const detail = useMemo(() => {
    if (!classData) return null
    const rosterStudents = students.filter((s) => !s.is_deleted)
    return buildClassDetailForUi(classData, rosterStudents, teacherProfile)
  }, [classData, students, teacherProfile])

  const conductLogs = useMemo(
    () => (detail?.code ? getConductLogsForClass(detail.code) : []),
    [detail?.code],
  )

  if (!classId) {
    return <Navigate to="/admin/classes" replace />
  }

  if (loadError && !classData) {
    return (
      <AdminShell activeKey="lop-hoc" headerTitle="Lớp học" searchPlaceholder="">
        <div className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">{loadError}</div>
        <Link to="/admin/classes" className="inline-block mt-4 font-bold text-primary">
          ← Quay lại danh sách
        </Link>
      </AdminShell>
    )
  }

  if (!classData) {
    return (
      <AdminShell activeKey="lop-hoc" headerTitle="Lớp học" searchPlaceholder="">
        <p className="text-on-surface-variant">Đang tải…</p>
      </AdminShell>
    )
  }

  if (!detail) {
    return <Navigate to="/admin/classes" replace />
  }

  async function handleUpdate(id, payload) {
    await updateClass(id, payload, classesRaw)
  }

  return (
    <AdminShell
      activeKey="lop-hoc"
      headerTitle={`Tổ chức · Lớp ${detail.code}`}
      searchPlaceholder="Tìm trong lớp (học sinh, ghi chú)..."
    >
      <ClassCreateModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdate}
        editingClass={classData}
        defaultSchoolYear={classData.school_year}
        existingClassKeys={existingClassKeys}
        teachers={teachers}
      />

      <ClassDetailBreadcrumb classCode={detail.code} />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div className="min-w-0 space-y-2">
          <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Lớp {detail.code}</h2>
          <p className="text-on-surface-variant text-base max-w-2xl font-body">
            Tổng quan lớp và danh sách học sinh (Firestore). Điểm tác phong mẫu bên dưới sẽ nối dữ liệu thật sau.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/admin/classes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Quay lại danh sách
          </Link>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            Sửa thông tin lớp
          </button>
        </div>
      </div>

      <ClassDetailOverview detail={detail} />

      <div className="grid gap-8 xl:grid-cols-[1fr_340px] xl:items-start">
        <ClassDetailTabs key={detail.code} roster={detail.roster} conductLogs={conductLogs} />
        <ClassDetailConductPanel detail={detail} />
      </div>
    </AdminShell>
  )
}
