import { useEffect, useRef } from 'react'

export function useSpotlight<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    let frame = 0
    let clientX = 0
    let clientY = 0
    // pointermove can fire well above the display refresh rate; coalesce into one
    // layout read + style write per animation frame.
    const flush = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${clientX - rect.left}px`)
      el.style.setProperty('--spot-y', `${clientY - rect.top}px`)
    }
    const onMove = (e: PointerEvent) => {
      clientX = e.clientX
      clientY = e.clientY
      if (!frame) frame = requestAnimationFrame(flush)
    }
    const onEnter = () => el.style.setProperty('--spot-o', '1')
    const onLeave = () => el.style.setProperty('--spot-o', '0')

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.style.setProperty('--spot-o', '0')
    }
  }, [enabled])

  return ref
}
