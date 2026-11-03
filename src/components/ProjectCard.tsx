import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../types'
import { useAdminMode } from '../hooks/useAdminMode'
import { useSiteConfig } from '../hooks/useSiteConfig'
import SpotlightCard from './ui/SpotlightCard'

interface Props {
  project: Project
  onOpen: (p: Project) => void
}

export default function ProjectCard({ project, onOpen }: Props) {
  const { isAdmin, editProject } = useAdminMode()
  const { labels } = useSiteConfig().config.work
  const [broken, setBroken] = useState(false)

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} whileHover={{ y: -6 }} className="group relative">
      <SpotlightCard color={project.accent} className="h-full">
        <button type="button" onClick={() => onOpen(project)} className="block w-full text-left focus-visible:outline-none" aria-label={`${project.title} – ${labels.open}`}>
          <div className="relative aspect-[4/3] overflow-hidden">
            {project.thumbnail && !broken ? (
              <img src={project.thumbnail} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full" style={{ background: `radial-gradient(circle at 30% 20%, ${project.accent}, transparent 60%), #0c0c10` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
            <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] text-fg/80">{project.category}</span>
            {project.mediaType === 'video' && project.videoUrl && (
              <span className="glass absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xs" aria-hidden>▶</span>
            )}
          </div>
          <div className="relative space-y-3 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
              <span className="text-xs text-fg/40">{project.year}</span>
            </div>
            <p className="line-clamp-2 text-sm text-fg/55">{project.summary}</p>
            <ul className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <li key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-fg/60">{t}</li>
              ))}
            </ul>
          </div>
        </button>
      </SpotlightCard>
      {isAdmin && (
        <button type="button" onClick={() => editProject(project.id)} className="absolute right-3 top-14 z-20 rounded-full bg-accent px-3 py-1 text-xs font-medium text-bg shadow-lg">
          Bearbeiten
        </button>
      )}
    </motion.div>
  )
}
