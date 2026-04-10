import { useEffect, useState } from 'react'

/**
 * Avatar tròn: có URL thì hiển thị ảnh (lỗi tải → icon); không có URL → icon `person`.
 */
export default function AvatarDisplay({
  src,
  alt = '',
  className = 'w-10 h-10',
  iconClassName = 'text-xl',
}) {
  const [broken, setBroken] = useState(false)
  const trimmed = typeof src === 'string' ? src.trim() : ''

  useEffect(() => {
    setBroken(false)
  }, [trimmed])

  const showImg = Boolean(trimmed) && !broken

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-200 ${className}`}
    >
      {showImg ? (
        <img
          alt={alt}
          src={trimmed}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className={`material-symbols-outlined leading-none select-none ${iconClassName}`}>person</span>
      )}
    </div>
  )
}
