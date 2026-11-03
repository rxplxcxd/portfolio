import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Options {
  enabled: boolean
  duration: number
  speed: number
  charset: string
  decodeOnMount?: boolean
}

export function useScramble(text: string, { enabled, duration, speed, charset, decodeOnMount = true }: Options) {
  const reduced = useReducedMotion()
  const [output, setOutput] = useState(enabled && decodeOnMount ? '' : text)
  const previous = useRef(decodeOnMount ? '' : text)

  useEffect(() => {
    const from = previous.current
    previous.current = text
    if (!enabled || reduced || !charset) {
      setOutput(text)
      return
    }
    const glyphs = charset.split('')
    const random = () => glyphs[Math.floor(Math.random() * glyphs.length)]
    const length = Math.max(from.length, text.length)
    // Each character gets its own start/settle window so the word resolves irregularly instead of left-to-right.
    const queue = Array.from({ length }, (_, i) => {
      const start = Math.random() * 0.45
      return { from: from[i] ?? '', to: text[i] ?? '', start, end: Math.min(1, start + 0.35 + Math.random() * 0.25), glyph: random() }
    })
    const t0 = performance.now()
    let lastSwap = 0
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - t0) / Math.max(1, duration))
      const swap = now - lastSwap >= speed
      if (swap) lastSwap = now
      let out = ''
      for (const q of queue) {
        if (progress >= q.end) out += q.to
        else if (progress >= q.start) {
          if (swap) q.glyph = random()
          out += q.to === ' ' ? ' ' : q.glyph
        } else out += q.from
      }
      setOutput(out)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, enabled, reduced, duration, speed, charset])

  return output
}
