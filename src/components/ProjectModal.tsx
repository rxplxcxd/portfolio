import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project } from '../types'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { toEmbedUrl } from '../lib/utils'

interface Props {
  project: Project | null
  onClose: () => void
}

function VideoPlayer({ project }: { project: Project }) {
  const { labels } = useSiteConfig().config.work
  const [playing, setPlaying] = useState(false)
  const embed = project.videoUrl ? toEmbedUrl(project.videoUrl) : null

  if (playing && embed) {
    return embed.kind === 'video' ? (
      <video src={embed.src} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />
    ) : (
      <iframe src={embed.src} title={project.title} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
    )
  }
  // The iframe is only mounted after an explicit click: no third-party requests or cookies before that.
  return (
    <button type="button" disabled={!embed} onClick={() => setPlaying(true)} className="group relative block h-full w-full">
      {project.thumbnail && <img src={project.thumbnail} alt="" className="h-full w-full object-cover opacity-70" />}
      <span className="absolute inset-0 grid place-items-center">
        {embed ? (
          <span className="glass flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-transform group-hover:scale-105">▶ {labels.play}</span>
        ) : (
          <span className="glass rounded-full px-5 py-2.5 text-sm text-fg/70">{labels.noVideo}</span>
        )}
      </span>
    </button>
  )
}

function Gallery({ project }: { project: Project }) {
  const images = project.images.length ? project.images : project.thumbnail ? [project.thumbnail] : []
  const [index, setIndex] = useState(0)
  if (!images.length) return <div className="h-full w-full" style={{ background: `radial-gradient(circle at 30% 20%, ${project.accent}, transparent 60%)` }} />
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length)

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img key={images[index]} src={images[index]} alt={`${project.title} – Bild ${index + 1}`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 h-full w-full object-cover" />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Vorheriges Bild" className="glass absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full">‹</button>
          <button type="button" onClick={() => go(1)} aria-label="Nächstes Bild" className="glass absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full">›</button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <button key={src + i} type="button" onClick={() => setIndex(i)} aria-label={`Bild ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-fg' : 'w-1.5 bg-fg/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function ProjectModal({ project, onClose }: Props) {
  const { labels } = useSiteConfig().config.work

  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            className="glass relative max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bg/80 sm:rounded-3xl"
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              {project.mediaType === 'video' ? <VideoPlayer project={project} /> : <Gallery project={project} />}
            </div>
            <button type="button" onClick={onClose} aria-label={labels.close} className="glass absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full text-lg">×</button>
            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.6fr_1fr]">
              <div>
                <p className="eyebrow mb-3" style={{ color: project.accent }}>{project.category}</p>
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h3>
                <p className="mt-5 whitespace-pre-line leading-relaxed text-fg/65">{project.description}</p>
              </div>
              <dl className="space-y-4 text-sm">
                {[[labels.role, project.role], [labels.year, project.year], [labels.client, project.client]].map(([k, v]) => (
                  <div key={k} className="border-b border-white/10 pb-3">
                    <dt className="text-fg/40">{k}</dt>
                    <dd className="mt-1 text-fg/85">{v}</dd>
                  </div>
                ))}
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((t) => <li key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-fg/60">{t}</li>)}
                </ul>
              </dl>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
