import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useAdminMode } from '../hooks/useAdminMode'
import { scrollToId } from '../lib/utils'
import Editable from './ui/Editable'
import ScrambleText from './ui/ScrambleText'
import BlurFade from './ui/BlurFade'

export default function Hero() {
  const { config, patch } = useSiteConfig()
  const { isAdmin } = useAdminMode()
  const { hero, animations: a, sections } = config
  const words = hero.words.length ? hero.words : ['']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % words.length), Math.max(800, a.wordInterval))
    return () => window.clearInterval(t)
  }, [words.length, a.wordInterval])

  const word = words[index % words.length]

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto w-full max-w-site">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <Editable value={hero.eyebrow} onCommit={(eyebrow) => patch('hero', { eyebrow })} className="text-xs font-medium tracking-wide text-fg/70" />
        </motion.div>

        <h1 className="text-display font-semibold">
          <Editable value={hero.headlinePrefix} onCommit={(headlinePrefix) => patch('hero', { headlinePrefix })} className="block text-fg/90">
            {(v) => <BlurFade text={v} />}
          </Editable>
          <span className="relative block min-h-[1.05em] bg-gradient-to-r from-fg via-accent to-glow2 bg-clip-text pb-[0.08em] text-transparent">
            {a.scramble ? (
              <ScrambleText text={word} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.span key={word} className="inline-block" initial={{ opacity: 0, y: '0.3em' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '-0.3em' }}>
                  {word}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        </h1>
        {isAdmin && <p className="mt-2 text-xs text-accent/80">Animierte Wörter im Admin-Panel → Allgemein bearbeiten.</p>}

        <Editable value={hero.subtitle} onCommit={(subtitle) => patch('hero', { subtitle })} as="p" multiline className="mt-8 max-w-2xl text-lead text-fg/60">
          {(v) => <BlurFade text={v} delay={0.25} />}
        </Editable>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-3">
          <motion.a href="#work" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.preventDefault(); if (!isAdmin) scrollToId(sections.work ? 'work' : 'about') }} className="btn bg-fg text-bg hover:bg-fg/90">
            <Editable value={hero.ctaPrimary} onCommit={(ctaPrimary) => patch('hero', { ctaPrimary })} />
            <span aria-hidden>→</span>
          </motion.a>
          <motion.a href="#contact" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.preventDefault(); if (!isAdmin) scrollToId('contact') }} className="btn glass text-fg hover:bg-white/10">
            <Editable value={hero.ctaSecondary} onCommit={(ctaSecondary) => patch('hero', { ctaSecondary })} />
          </motion.a>
        </motion.div>
      </div>

      {a.scrollIndicator && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-fg/40">
          <span className="h-10 w-6 rounded-full border border-white/20 p-1">
            <span className="block h-2 w-full animate-scroll rounded-full bg-fg/60" />
          </span>
          <Editable value={hero.scrollHint} onCommit={(scrollHint) => patch('hero', { scrollHint })} className="text-[10px] uppercase tracking-[0.3em]" />
        </div>
      )}
    </section>
  )
}
