import logoUrl from '../assets/logotruong.png'

/**
 * Logo trường (src/assets/logotruong.png) — dùng sidebar, màn đăng nhập, v.v.
 */
export default function ProjectLogo({
  className = 'h-full w-full object-contain',
  alt = 'Logo Trường THCS Tam Bình',
}) {
  return <img src={logoUrl} alt={alt} className={className} decoding="async" />
}

export { logoUrl as projectLogoUrl }
