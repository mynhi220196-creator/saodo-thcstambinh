import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { formatDateTimeVN } from '../lib/dateFormat.js'
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeMyNotifications,
} from '../lib/notificationsFirestore.js'

/**
 * Chuông thông báo in-app. Tự lấy uid + role từ Auth, lắng nghe realtime.
 * props: accent 'blue' | 'emerald' (màu badge theo cổng)
 */
export default function NotificationBell({ accent = 'blue' }) {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const uid = user?.id ?? ''
  const isAdmin = profile?.role === 'ADMIN'
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!uid) {
      setItems([])
      return undefined
    }
    return subscribeMyNotifications({ uid, isAdmin }, setItems, () => {})
  }, [uid, isAdmin])

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])
  const badgeColor = accent === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'

  async function handleOpenItem(n) {
    if (!n.read) markNotificationRead(n.id).catch(() => {})
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-all cursor-pointer active:scale-95"
        aria-label={`Thông báo${unread ? ` (${unread} chưa đọc)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unread > 0 ? (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white ${badgeColor}`}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-1 z-[80] w-[22rem] max-w-[90vw] rounded-xl border border-outline-variant/20 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/15">
            <p className="font-extrabold text-on-surface text-sm">Thông báo</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => markAllNotificationsRead(items).catch(() => {})}
                className="text-xs font-bold text-primary hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            ) : null}
          </div>

          <div className="max-h-[26rem] overflow-y-auto divide-y divide-outline-variant/10">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-3xl text-outline-variant block mb-1">
                  notifications_off
                </span>
                Chưa có thông báo nào.
              </div>
            ) : (
              items.slice(0, 30).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-sky-50/60 dark:bg-sky-950/20'}`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenItem(n)}
                    className="flex items-start gap-3 flex-1 text-left min-w-0"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5 shrink-0">
                      {n.icon}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm leading-snug ${n.read ? 'font-medium text-on-surface' : 'font-extrabold text-on-surface'}`}>
                        {n.title}
                      </span>
                      <span className="block text-xs text-on-surface-variant mt-0.5 leading-snug">{n.body}</span>
                      {n._createdMs ? (
                        <span className="block text-[10px] text-on-surface-variant/70 mt-1 tabular-nums">
                          {formatDateTimeVN(n._createdMs)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id).catch(() => {})}
                    className="shrink-0 p-1 rounded-md text-on-surface-variant/60 hover:text-error hover:bg-error-container/20"
                    aria-label="Xóa thông báo"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
