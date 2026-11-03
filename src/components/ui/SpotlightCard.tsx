import type { CSSProperties, ReactNode } from 'react'
import { useSpotlight } from '../../hooks/useSpotlight'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { cn } from '../../lib/utils'

interface Props {
  children: ReactNode
  className?: string
  color?: string
}

export default function SpotlightCard({ children, className, color }: Props) {
  const { animations: a } = useSiteConfig().config
  const ref = useSpotlight<HTMLDivElement>(a.spotlight)
  const tint = color ?? 'rgb(var(--accent))'
  const style = {
    background: `radial-gradient(${a.spotlightSize}px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, ${tint} ${Math.round(a.spotlightOpacity * 100)}%, transparent), transparent 70%)`,
    opacity: 'var(--spot-o, 0)',
  } as CSSProperties

  return (
    <div ref={ref} className={cn('glass relative overflow-hidden rounded-3xl', className)}>
      {a.spotlight && <div aria-hidden className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" style={style} />}
      {children}
    </div>
  )
}
