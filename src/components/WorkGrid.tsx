import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import type { Project } from '../types'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { cn } from '../lib/utils'
import Editable from './ui/Editable'
import BlurFade from './ui/BlurFade'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

export default function WorkGrid() {
  const { config, patch } = useSiteConfig()
  const { work } = config
  const [filter, setFilter] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = useMemo(() => (filter ? work.projects.filter((p) => p.category === filter) : work.projects), [filter, work.projects])
  const open = work.projects.find((p) => p.id === openId) ?? null
  const close = useCallback(() => setOpenId(null), [])
  const filters: { key: string | null; label: string }[] = [{ key: null, label: work.allLabel }, ...work.categories.map((c) => ({ key: c, label: c }))]

  return (
    <section id="work" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-site">
        <Editable value={work.eyebrow} onCommit={(eyebrow) => patch('work', { eyebrow })} as="p" className="eyebrow mb-4" />
        <Editable value={work.title} onCommit={(title) => patch('work', { title })} as="h2" className="text-h2 font-semibold">
          {(v) => <BlurFade text={v} />}
        </Editable>
        <Editable value={work.intro} onCommit={(intro) => patch('work', { intro })} as="p" multiline className="mt-5 max-w-xl text-lead text-fg/55">
          {(v) => <BlurFade text={v} delay={0.15} />}
        </Editable>

        <LayoutGroup id="filters">
          <div role="tablist" className="mt-12 flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = filter === f.key
              return (
                <button key={f.label} role="tab" aria-selected={active} type="button" onClick={() => setFilter(f.key)} className={cn('relative rounded-full px-4 py-2 text-sm transition-colors', active ? 'text-bg' : 'text-fg/65 hover:text-fg')}>
                  {active && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-fg" />}
                  <span className="relative">{f.label}</span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p: Project) => <ProjectCard key={p.id} project={p} onOpen={(proj) => setOpenId(proj.id)} />)}
          </AnimatePresence>
        </motion.div>
        {!visible.length && <p className="mt-10 text-fg/45">{work.emptyText}</p>}
      </div>
      <ProjectModal project={open} onClose={close} />
    </section>
  )
}
