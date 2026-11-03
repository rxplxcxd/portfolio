import { useEffect, useRef, useState, type ElementType } from 'react'
import { createElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSiteConfig } from '../../hooks/useSiteConfig'

interface Props {
  text: string
  as?: ElementType
  className?: string
  delay?: number
}

export default function BlurFade({ text, as = 'span', className, delay = 0 }: Props) {
  const { animations: a } = useSiteConfig().config
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const active = a.blurFade && !reduced

  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    // One-shot: disconnect after the first intersection so the reveal never replays on scroll-back.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [active])

  if (!active) return createElement(as, { className }, text)

  const words = text.split(/(\s+)/)
  return createElement(
    as,
    { ref, className, 'aria-label': text },
    words.map((w, i) =>
      /^\s+$/.test(w) ? (
        w
      ) : (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block will-change-[filter,opacity,transform]"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
          animate={visible ? { opacity: 1, filter: 'blur(0px)', y: 0 } : undefined}
          transition={{ duration: a.blurFadeDuration, delay: delay + (i / 2) * a.blurFadeStagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
        </motion.span>
      ),
    ),
  )
}
