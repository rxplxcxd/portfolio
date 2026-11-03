import { motion } from 'framer-motion'
import { useSiteConfig } from '../hooks/useSiteConfig'
import Editable from './ui/Editable'
import BlurFade from './ui/BlurFade'
import SpotlightCard from './ui/SpotlightCard'

export default function About() {
  const { config, patch } = useSiteConfig()
  const { about, sections } = config
  const setBio = (i: number, v: string) => patch('about', { bio: about.bio.map((b, j) => (j === i ? v : b)).filter(Boolean) })

  return (
    <section id="about" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-site">
        {sections.about && (
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <SpotlightCard className="self-start p-7 sm:p-8">
              <div className="flex items-center gap-4">
                {about.avatar ? (
                  <img src={about.avatar} alt={about.name} className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-accent to-glow2 text-2xl font-semibold text-bg">{about.initials}</div>
                )}
                <div>
                  <Editable value={about.name} onCommit={(name) => patch('about', { name })} as="p" className="text-xl font-semibold tracking-tight" />
                  <Editable value={about.role} onCommit={(role) => patch('about', { role })} as="p" className="text-sm text-fg/55" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <Editable value={about.availability} onCommit={(availability) => patch('about', { availability })} />
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-fg/45">Standort</dt>
                  <Editable value={about.location} onCommit={(location) => patch('about', { location })} as="dd" className="text-right text-fg/85" />
                </div>
                {about.facts.map((f, i) => (
                  <div key={i} className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-0">
                    <Editable value={f.label} onCommit={(label) => patch('about', { facts: about.facts.map((x, j) => (j === i ? { ...x, label } : x)) })} as="dt" className="text-fg/45" />
                    <Editable value={f.value} onCommit={(value) => patch('about', { facts: about.facts.map((x, j) => (j === i ? { ...x, value } : x)) })} as="dd" className="text-right text-fg/85" />
                  </div>
                ))}
              </dl>
            </SpotlightCard>

            <div>
              <Editable value={about.eyebrow} onCommit={(eyebrow) => patch('about', { eyebrow })} as="p" className="eyebrow mb-4" />
              <Editable value={about.title} onCommit={(title) => patch('about', { title })} as="h2" className="text-h2 font-semibold">
                {(v) => <BlurFade text={v} />}
              </Editable>
              <div className="mt-8 space-y-5">
                {about.bio.map((p, i) => (
                  <Editable key={i} value={p} onCommit={(v) => setBio(i, v)} as="p" multiline className="text-lead text-fg/60">
                    {(v) => <BlurFade text={v} delay={0.1 * i} />}
                  </Editable>
                ))}
              </div>
            </div>
          </div>
        )}

        {sections.tools && (
          <div className={sections.about ? 'mt-24' : ''}>
            <Editable value={about.toolsTitle} onCommit={(toolsTitle) => patch('about', { toolsTitle })} as="h3" className="text-3xl font-semibold tracking-tight" />
            <Editable value={about.toolsIntro} onCommit={(toolsIntro) => patch('about', { toolsIntro })} as="p" className="mt-3 text-fg/55" />
            <div className="mt-10 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {about.tools.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
                  <SpotlightCard color={t.color} className="p-5">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border text-sm font-bold" style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}14` }}>{t.short}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{t.name}</p>
                        <p className="truncate text-xs text-fg/45">{t.category} · {t.years}</p>
                      </div>
                      <span className="text-sm tabular-nums text-fg/60">{t.level}%</span>
                    </div>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-full rounded-full" style={{ background: t.color }} initial={{ width: 0 }} whileInView={{ width: `${t.level}%` }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.05 }} />
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
