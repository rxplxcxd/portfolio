import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdminMode, type PanelTab } from '../hooks/useAdminMode'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { emptyProject, emptyTool } from '../data/defaults'
import { cn, fileToDataUrl, uid } from '../lib/utils'
import type { AnimationConfig, Project, SiteConfig, ThemeConfig, Tool } from '../types'

const tabs: { id: PanelTab; label: string }[] = [
  { id: 'general', label: 'Allgemein' },
  { id: 'design', label: 'Design' },
  { id: 'motion', label: 'Animation' },
  { id: 'projects', label: 'Projekte' },
  { id: 'about', label: 'Über mich' },
  { id: 'contact', label: 'Kontakt' },
  { id: 'data', label: 'Daten' },
]

const presets: { name: string; theme: ThemeConfig }[] = [
  { name: 'Nacht', theme: { background: '#050507', foreground: '#f5f5f7', accent: '#8b7cff', glowPrimary: '#5b4bff', glowSecondary: '#00b3ff' } },
  { name: 'Ozean', theme: { background: '#03070c', foreground: '#eef6ff', accent: '#38bdf8', glowPrimary: '#0ea5e9', glowSecondary: '#14b8a6' } },
  { name: 'Glut', theme: { background: '#0a0505', foreground: '#fff5f0', accent: '#ff7a45', glowPrimary: '#ff3d00', glowSecondary: '#ffb300' } },
  { name: 'Wald', theme: { background: '#040806', foreground: '#f0fff4', accent: '#4ade80', glowPrimary: '#16a34a', glowSecondary: '#a3e635' } },
  { name: 'Mono', theme: { background: '#000000', foreground: '#ffffff', accent: '#e5e5e5', glowPrimary: '#525252', glowSecondary: '#a3a3a3' } },
]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-white/10 p-4">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg/45">{title}</legend>
      {children}
    </fieldset>
  )
}

function Field({ label, value, onChange, textarea, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string; placeholder?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-fg/55">{label}</span>
      {textarea ? (
        <textarea className="admin-input min-h-[88px] resize-y" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="admin-input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-1 text-sm text-fg/80">
      {label}
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-white/15')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </span>
    </button>
  )
}

function Range({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-xs text-fg/55">{label}<span className="tabular-nums text-fg/80">{value}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
    </label>
  )
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
      <span className="flex-1 text-xs text-fg/60">{label}</span>
      <input className="admin-input w-28 font-mono text-xs" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function StringList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-fg/55">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className="admin-input" value={item} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <IconBtn label="Nach oben" disabled={i === 0} onClick={() => onChange(move(items, i, -1))}>↑</IconBtn>
          <IconBtn label="Entfernen" onClick={() => onChange(items.filter((_, j) => j !== i))}>×</IconBtn>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="text-xs text-accent hover:underline">+ Hinzufügen</button>
    </div>
  )
}

function IconBtn({ children, onClick, label, disabled }: { children: ReactNode; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-fg/70 hover:bg-white/5 disabled:opacity-30">
      {children}
    </button>
  )
}

function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange(await fileToDataUrl(file))
    e.target.value = ''
  }
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-fg/55">{label}</span>
      <div className="flex gap-2">
        <input className="admin-input" value={value.startsWith('data:') ? '(hochgeladenes Bild)' : value} placeholder="https://… oder /media/bild.jpg" onChange={(e) => onChange(e.target.value)} />
        <IconBtn label="Bild hochladen" onClick={() => input.current?.click()}>⇪</IconBtn>
        <input ref={input} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      {value && <img src={value} alt="" className="h-16 w-24 rounded-md object-cover" />}
    </div>
  )
}

function move<T>(list: T[], i: number, d: number) {
  const next = [...list]
  const j = i + d
  if (j < 0 || j >= next.length) return next
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

function ProjectEditor({ project, categories, onChange }: { project: Project; categories: string[]; onChange: (p: Project) => void }) {
  const set = <K extends keyof Project>(k: K, v: Project[K]) => onChange({ ...project, [k]: v })
  return (
    <div className="space-y-3 pt-3">
      <Field label="Titel" value={project.title} onChange={(v) => set('title', v)} />
      <label className="block space-y-1.5">
        <span className="text-xs text-fg/55">Kategorie</span>
        <select className="admin-input" value={project.category} onChange={(e) => set('category', e.target.value)}>
          {[...new Set([...categories, project.category])].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Jahr" value={project.year} onChange={(v) => set('year', v)} />
        <Color label="Akzent" value={project.accent} onChange={(v) => set('accent', v)} />
      </div>
      <Field label="Rolle" value={project.role} onChange={(v) => set('role', v)} />
      <Field label="Auftrag / Kunde" value={project.client} onChange={(v) => set('client', v)} />
      <Field label="Kurzbeschreibung (Karte)" value={project.summary} onChange={(v) => set('summary', v)} textarea />
      <Field label="Beschreibung (Detailansicht)" value={project.description} onChange={(v) => set('description', v)} textarea />
      <Field label="Tags (kommagetrennt)" value={project.tags.join(', ')} onChange={(v) => set('tags', v.split(',').map((t) => t.trim()).filter(Boolean))} />
      <ImageInput label="Vorschaubild" value={project.thumbnail} onChange={(v) => set('thumbnail', v)} />
      <div className="flex gap-2">
        {(['video', 'gallery'] as const).map((m) => (
          <button key={m} type="button" onClick={() => set('mediaType', m)} className={cn('flex-1 rounded-lg border px-3 py-2 text-xs', project.mediaType === m ? 'border-accent bg-accent/15 text-fg' : 'border-white/10 text-fg/60')}>
            {m === 'video' ? 'Video' : 'Bild-Galerie'}
          </button>
        ))}
      </div>
      {project.mediaType === 'video' ? (
        <Field label="Video-URL (YouTube, Vimeo oder .mp4)" value={project.videoUrl} onChange={(v) => set('videoUrl', v)} placeholder="https://youtu.be/…" />
      ) : (
        <div className="space-y-3">
          {project.images.map((src, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1"><ImageInput label={`Bild ${i + 1}`} value={src} onChange={(v) => set('images', project.images.map((x, j) => (j === i ? v : x)))} /></div>
              <IconBtn label="Bild entfernen" onClick={() => set('images', project.images.filter((_, j) => j !== i))}>×</IconBtn>
            </div>
          ))}
          <button type="button" onClick={() => set('images', [...project.images, ''])} className="text-xs text-accent hover:underline">+ Bild hinzufügen</button>
        </div>
      )}
    </div>
  )
}

function ToolEditor({ tool, onChange }: { tool: Tool; onChange: (t: Tool) => void }) {
  const set = <K extends keyof Tool>(k: K, v: Tool[K]) => onChange({ ...tool, [k]: v })
  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-[1fr_80px] gap-2">
        <Field label="Name" value={tool.name} onChange={(v) => set('name', v)} />
        <Field label="Kürzel" value={tool.short} onChange={(v) => set('short', v.slice(0, 3))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Bereich" value={tool.category} onChange={(v) => set('category', v)} />
        <Field label="Erfahrung" value={tool.years} onChange={(v) => set('years', v)} />
      </div>
      <Range label="Skill-Level" value={tool.level} min={0} max={100} unit="%" onChange={(v) => set('level', v)} />
      <Color label="Farbe" value={tool.color} onChange={(v) => set('color', v)} />
    </div>
  )
}

function Collapsible({ title, open, onToggle, actions, children }: { title: string; open: boolean; onToggle: () => void; actions: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onToggle} className="flex-1 truncate text-left text-sm font-medium">{open ? '▾' : '▸'} {title}</button>
        {actions}
      </div>
      {open && children}
    </div>
  )
}

export default function AdminPanel() {
  const { isAdmin, panelOpen, setPanelOpen, tab, setTab, editingProjectId, editProject } = useAdminMode()
  const { config, patch, setConfig, reset, exportConfig, importConfig } = useSiteConfig()
  const [openTool, setOpenTool] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const { meta, hero, nav, theme, animations: a, sections, work, about, contact, footer, socials } = config

  const anim = (v: Partial<AnimationConfig>) => patch('animations', v)
  const setProjects = (projects: Project[]) => patch('work', { projects })
  const setTools = (tools: Tool[]) => patch('about', { tools })

  const download = () => {
    const blob = new Blob([exportConfig()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'content.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      importConfig(await file.text())
      setMessage('Import erfolgreich.')
    } catch {
      setMessage('Datei konnte nicht gelesen werden – ist es eine gültige content.json?')
    }
  }

  if (!isAdmin) return null

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.aside
          initial={{ x: '105%' }}
          animate={{ x: 0 }}
          exit={{ x: '105%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className="fixed bottom-3 right-3 top-[52px] z-[55] flex w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-bg/90 shadow-2xl shadow-black/60 backdrop-blur-xl"
          aria-label="Admin-Panel"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="text-sm font-semibold">Inhalte & Design</p>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Panel schließen" className="text-xl text-fg/60 hover:text-fg">×</button>
          </div>
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs', tab === t.id ? 'bg-fg text-bg' : 'text-fg/60 hover:bg-white/5')}>{t.label}</button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {tab === 'general' && (
              <>
                <Group title="Seite">
                  <Field label="Browser-Titel" value={meta.documentTitle} onChange={(documentTitle) => patch('meta', { documentTitle })} />
                  <Field label="Meta-Beschreibung (SEO)" value={meta.description} onChange={(description) => patch('meta', { description })} textarea />
                  <Field label="Name / Logo in der Navigation" value={meta.brand} onChange={(brand) => patch('meta', { brand })} />
                </Group>
                <Group title="Hero">
                  <Field label="Badge über dem Titel" value={hero.eyebrow} onChange={(eyebrow) => patch('hero', { eyebrow })} />
                  <Field label="Titel (feste Zeile)" value={hero.headlinePrefix} onChange={(headlinePrefix) => patch('hero', { headlinePrefix })} />
                  <StringList label="Animierte Wörter (Scramble)" items={hero.words} onChange={(words) => patch('hero', { words })} />
                  <Field label="Untertitel" value={hero.subtitle} onChange={(subtitle) => patch('hero', { subtitle })} textarea />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Button 1" value={hero.ctaPrimary} onChange={(ctaPrimary) => patch('hero', { ctaPrimary })} />
                    <Field label="Button 2" value={hero.ctaSecondary} onChange={(ctaSecondary) => patch('hero', { ctaSecondary })} />
                  </div>
                  <Field label="Scroll-Hinweis" value={hero.scrollHint} onChange={(scrollHint) => patch('hero', { scrollHint })} />
                </Group>
                <Group title="Navigation">
                  {(['work', 'about', 'contact', 'menu'] as const).map((k) => (
                    <Field key={k} label={{ work: 'Arbeiten', about: 'Über mich', contact: 'Kontakt', menu: 'Mobil-Menü' }[k]} value={nav[k]} onChange={(v) => patch('nav', { [k]: v })} />
                  ))}
                </Group>
                <Group title="Sektionen anzeigen">
                  {(Object.keys(sections) as (keyof SiteConfig['sections'])[]).map((k) => (
                    <Toggle key={k} label={{ work: 'Arbeiten', about: 'Über mich', tools: 'Werkzeuge', contact: 'Kontakt' }[k]} checked={sections[k]} onChange={(v) => patch('sections', { [k]: v })} />
                  ))}
                </Group>
              </>
            )}

            {tab === 'design' && (
              <>
                <Group title="Vorlagen">
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => (
                      <button key={p.name} type="button" onClick={() => patch('theme', p.theme)} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                        <span className="h-3 w-3 rounded-full" style={{ background: p.theme.accent }} />{p.name}
                      </button>
                    ))}
                  </div>
                </Group>
                <Group title="Farben">
                  <Color label="Hintergrund" value={theme.background} onChange={(background) => patch('theme', { background })} />
                  <Color label="Text" value={theme.foreground} onChange={(foreground) => patch('theme', { foreground })} />
                  <Color label="Akzent" value={theme.accent} onChange={(accent) => patch('theme', { accent })} />
                  <Color label="Glow 1" value={theme.glowPrimary} onChange={(glowPrimary) => patch('theme', { glowPrimary })} />
                  <Color label="Glow 2" value={theme.glowSecondary} onChange={(glowSecondary) => patch('theme', { glowSecondary })} />
                </Group>
                <Group title="Ambient">
                  <Toggle label="Hintergrund-Glows" checked={a.ambientGlows} onChange={(ambientGlows) => anim({ ambientGlows })} />
                  <Toggle label="Glows bewegen sich" checked={a.glowDrift} onChange={(glowDrift) => anim({ glowDrift })} />
                </Group>
              </>
            )}

            {tab === 'motion' && (
              <>
                <Group title="Scramble-Text">
                  <Toggle label="Aktiv" checked={a.scramble} onChange={(scramble) => anim({ scramble })} />
                  <Range label="Dauer" value={a.scrambleDuration} min={200} max={3000} step={50} unit=" ms" onChange={(scrambleDuration) => anim({ scrambleDuration })} />
                  <Range label="Zeichenwechsel alle" value={a.scrambleSpeed} min={16} max={200} unit=" ms" onChange={(scrambleSpeed) => anim({ scrambleSpeed })} />
                  <Range label="Wortwechsel alle" value={a.wordInterval} min={1000} max={10000} step={100} unit=" ms" onChange={(wordInterval) => anim({ wordInterval })} />
                  <Field label="Zeichenvorrat" value={a.scrambleCharset} onChange={(scrambleCharset) => anim({ scrambleCharset })} />
                </Group>
                <Group title="Blur-Fade">
                  <Toggle label="Aktiv" checked={a.blurFade} onChange={(blurFade) => anim({ blurFade })} />
                  <Range label="Dauer" value={a.blurFadeDuration} min={0.1} max={2} step={0.05} unit=" s" onChange={(blurFadeDuration) => anim({ blurFadeDuration })} />
                  <Range label="Versatz pro Wort" value={a.blurFadeStagger} min={0} max={0.2} step={0.005} unit=" s" onChange={(blurFadeStagger) => anim({ blurFadeStagger })} />
                </Group>
                <Group title="Spotlight">
                  <Toggle label="Aktiv" checked={a.spotlight} onChange={(spotlight) => anim({ spotlight })} />
                  <Range label="Größe" value={a.spotlightSize} min={120} max={900} step={10} unit=" px" onChange={(spotlightSize) => anim({ spotlightSize })} />
                  <Range label="Intensität" value={a.spotlightOpacity} min={0.02} max={0.6} step={0.01} onChange={(spotlightOpacity) => anim({ spotlightOpacity })} />
                </Group>
                <Group title="Federung (Hover, Modal, Filter)">
                  <Range label="Steifigkeit" value={a.springStiffness} min={60} max={600} step={10} onChange={(springStiffness) => anim({ springStiffness })} />
                  <Range label="Dämpfung" value={a.springDamping} min={8} max={60} onChange={(springDamping) => anim({ springDamping })} />
                  <Toggle label="Scroll-Indikator" checked={a.scrollIndicator} onChange={(scrollIndicator) => anim({ scrollIndicator })} />
                </Group>
              </>
            )}

            {tab === 'projects' && (
              <>
                <Group title="Bereich">
                  <Field label="Überschrift" value={work.title} onChange={(title) => patch('work', { title })} />
                  <Field label="Einleitung" value={work.intro} onChange={(intro) => patch('work', { intro })} textarea />
                  <Field label="Filter „Alle“" value={work.allLabel} onChange={(allLabel) => patch('work', { allLabel })} />
                  <StringList label="Kategorien / Filter" items={work.categories} onChange={(categories) => patch('work', { categories })} />
                </Group>
                <Group title={`Projekte (${work.projects.length})`}>
                  {work.projects.map((p, i) => (
                    <Collapsible
                      key={p.id}
                      title={p.title}
                      open={editingProjectId === p.id}
                      onToggle={() => editProject(editingProjectId === p.id ? null : p.id)}
                      actions={
                        <>
                          <IconBtn label="Nach oben" disabled={i === 0} onClick={() => setProjects(move(work.projects, i, -1))}>↑</IconBtn>
                          <IconBtn label="Nach unten" disabled={i === work.projects.length - 1} onClick={() => setProjects(move(work.projects, i, 1))}>↓</IconBtn>
                          <IconBtn label="Löschen" onClick={() => window.confirm(`„${p.title}“ löschen?`) && setProjects(work.projects.filter((x) => x.id !== p.id))}>🗑</IconBtn>
                        </>
                      }
                    >
                      <ProjectEditor project={p} categories={work.categories} onChange={(np) => setProjects(work.projects.map((x) => (x.id === p.id ? np : x)))} />
                    </Collapsible>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const id = uid('projekt')
                      setProjects([{ ...emptyProject, id, category: work.categories[0] ?? emptyProject.category }, ...work.projects])
                      editProject(id)
                    }}
                    className="w-full rounded-xl border border-dashed border-accent/50 py-2.5 text-sm text-accent hover:bg-accent/10"
                  >
                    + Neues Projekt
                  </button>
                </Group>
                <Group title="Beschriftungen Detailansicht">
                  {(Object.keys(work.labels) as (keyof SiteConfig['work']['labels'])[]).map((k) => (
                    <Field key={k} label={k} value={work.labels[k]} onChange={(v) => patch('work', { labels: { ...work.labels, [k]: v } })} />
                  ))}
                  <Field label="Text bei leerer Kategorie" value={work.emptyText} onChange={(emptyText) => patch('work', { emptyText })} />
                </Group>
              </>
            )}

            {tab === 'about' && (
              <>
                <Group title="Profil">
                  <Field label="Name" value={about.name} onChange={(name) => patch('about', { name })} />
                  <Field label="Rolle" value={about.role} onChange={(role) => patch('about', { role })} />
                  <Field label="Standort" value={about.location} onChange={(location) => patch('about', { location })} />
                  <Field label="Verfügbarkeit" value={about.availability} onChange={(availability) => patch('about', { availability })} />
                  <Field label="Initialen (ohne Foto)" value={about.initials} onChange={(initials) => patch('about', { initials: initials.slice(0, 3) })} />
                  <ImageInput label="Profilfoto" value={about.avatar} onChange={(avatar) => patch('about', { avatar })} />
                </Group>
                <Group title="Text">
                  <Field label="Überschrift" value={about.title} onChange={(title) => patch('about', { title })} />
                  {about.bio.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1"><Field label={`Absatz ${i + 1}`} value={b} onChange={(v) => patch('about', { bio: about.bio.map((x, j) => (j === i ? v : x)) })} textarea /></div>
                      <IconBtn label="Absatz entfernen" onClick={() => patch('about', { bio: about.bio.filter((_, j) => j !== i) })}>×</IconBtn>
                    </div>
                  ))}
                  <button type="button" onClick={() => patch('about', { bio: [...about.bio, 'Neuer Absatz'] })} className="text-xs text-accent hover:underline">+ Absatz</button>
                </Group>
                <Group title="Steckbrief">
                  {about.facts.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="admin-input" value={f.label} onChange={(e) => patch('about', { facts: about.facts.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                      <input className="admin-input" value={f.value} onChange={(e) => patch('about', { facts: about.facts.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                      <IconBtn label="Entfernen" onClick={() => patch('about', { facts: about.facts.filter((_, j) => j !== i) })}>×</IconBtn>
                    </div>
                  ))}
                  <button type="button" onClick={() => patch('about', { facts: [...about.facts, { label: 'Neu', value: '…' }] })} className="text-xs text-accent hover:underline">+ Eintrag</button>
                </Group>
                <Group title={`Werkzeuge (${about.tools.length})`}>
                  <Field label="Überschrift" value={about.toolsTitle} onChange={(toolsTitle) => patch('about', { toolsTitle })} />
                  <Field label="Einleitung" value={about.toolsIntro} onChange={(toolsIntro) => patch('about', { toolsIntro })} />
                  {about.tools.map((t, i) => (
                    <Collapsible
                      key={t.id}
                      title={`${t.name} · ${t.level}%`}
                      open={openTool === t.id}
                      onToggle={() => setOpenTool(openTool === t.id ? null : t.id)}
                      actions={
                        <>
                          <IconBtn label="Nach oben" disabled={i === 0} onClick={() => setTools(move(about.tools, i, -1))}>↑</IconBtn>
                          <IconBtn label="Löschen" onClick={() => setTools(about.tools.filter((x) => x.id !== t.id))}>🗑</IconBtn>
                        </>
                      }
                    >
                      <ToolEditor tool={t} onChange={(nt) => setTools(about.tools.map((x) => (x.id === t.id ? nt : x)))} />
                    </Collapsible>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const id = uid('tool')
                      setTools([...about.tools, { ...emptyTool, id }])
                      setOpenTool(id)
                    }}
                    className="w-full rounded-xl border border-dashed border-accent/50 py-2.5 text-sm text-accent hover:bg-accent/10"
                  >
                    + Neues Tool
                  </button>
                </Group>
              </>
            )}

            {tab === 'contact' && (
              <>
                <Group title="Kontakt">
                  <Field label="Überschrift" value={contact.title} onChange={(title) => patch('contact', { title })} />
                  <Field label="Text" value={contact.text} onChange={(text) => patch('contact', { text })} textarea />
                  <Field label="Button" value={contact.cta} onChange={(cta) => patch('contact', { cta })} />
                  <Field label="E-Mail" type="email" value={contact.email} onChange={(email) => patch('contact', { email })} />
                  <Field label="Hinweis" value={contact.note} onChange={(note) => patch('contact', { note })} />
                </Group>
                <Group title="Social Links">
                  {socials.map((s, i) => (
                    <div key={s.id} className="flex gap-2">
                      <input className="admin-input w-28" value={s.label} onChange={(e) => patch('socials', socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) as never)} />
                      <input className="admin-input" value={s.url} onChange={(e) => patch('socials', socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) as never)} />
                      <IconBtn label="Entfernen" onClick={() => setConfig((c) => ({ ...c, socials: c.socials.filter((x) => x.id !== s.id) }))}>×</IconBtn>
                    </div>
                  ))}
                  <button type="button" onClick={() => setConfig((c) => ({ ...c, socials: [...c.socials, { id: uid('social'), label: 'Neu', url: 'https://' }] }))} className="text-xs text-accent hover:underline">+ Link hinzufügen</button>
                </Group>
                <Group title="Footer">
                  <Field label="Copyright ({year} = aktuelles Jahr)" value={footer.copyright} onChange={(copyright) => patch('footer', { copyright })} />
                  <Field label="Zusatzzeile" value={footer.note} onChange={(note) => patch('footer', { note })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Impressum-Text" value={footer.impressumLabel} onChange={(impressumLabel) => patch('footer', { impressumLabel })} />
                    <Field label="Impressum-Link" value={footer.impressumUrl} onChange={(impressumUrl) => patch('footer', { impressumUrl })} />
                    <Field label="Datenschutz-Text" value={footer.privacyLabel} onChange={(privacyLabel) => patch('footer', { privacyLabel })} />
                    <Field label="Datenschutz-Link" value={footer.privacyUrl} onChange={(privacyUrl) => patch('footer', { privacyUrl })} />
                  </div>
                </Group>
              </>
            )}

            {tab === 'data' && (
              <>
                <Group title="Veröffentlichen">
                  <p className="text-xs leading-relaxed text-fg/55">
                    Änderungen werden nur in diesem Browser gespeichert. Damit alle Besucher sie sehen: <b className="text-fg/80">content.json exportieren</b>, in den Ordner <code>public/</code> des Projekts legen und neu deployen.
                  </p>
                  <button type="button" onClick={download} className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-bg">content.json exportieren</button>
                  <button type="button" onClick={() => fileInput.current?.click()} className="w-full rounded-xl border border-white/15 py-2.5 text-sm hover:bg-white/5">JSON importieren</button>
                  <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onImport} />
                  {message && <p className="text-xs text-accent">{message}</p>}
                </Group>
                <Group title="Zurücksetzen">
                  <p className="text-xs text-fg/55">Verwirft alle lokalen Änderungen und lädt die veröffentlichten Standardinhalte.</p>
                  <button type="button" onClick={() => window.confirm('Alle lokalen Änderungen verwerfen?') && reset()} className="w-full rounded-xl border border-red-400/40 py-2.5 text-sm text-red-300 hover:bg-red-400/10">Auf Standard zurücksetzen</button>
                </Group>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
