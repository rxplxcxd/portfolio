import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useAdminMode } from '../hooks/useAdminMode'
import { cn, scrollToId } from '../lib/utils'
import Editable from './ui/Editable'

export default function Nav() {
  const { config, patch } = useSiteConfig()
  const { isAdmin, toggleAdmin } = useAdminMode()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { nav, sections, meta } = config

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { id: 'work', key: 'work' as const, show: sections.work },
    { id: 'about', key: 'about' as const, show: sections.about || sections.tools },
    { id: 'contact', key: 'contact' as const, show: sections.contact },
  ].filter((l) => l.show)

  const go = (id: string) => {
    if (isAdmin) return
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header className={cn('fixed inset-x-0 z-40 px-4 transition-[top] duration-300', isAdmin ? 'top-12' : 'top-4')}>
      <nav className={cn('mx-auto flex max-w-site items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5', scrolled ? 'glass shadow-2xl shadow-black/40' : 'border border-transparent')}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAdmin}
            aria-label={isAdmin ? 'Admin-Modus beenden' : 'Admin-Modus aktivieren'}
            title="Admin-Modus (Alt+Shift+A)"
            className={cn('h-2 w-2 rounded-full transition-all hover:scale-150', isAdmin ? 'bg-accent shadow-[0_0_12px_rgb(var(--accent))]' : 'bg-fg/25 hover:bg-fg/60')}
          />
          <a href="#top" onClick={(e) => { e.preventDefault(); if (!isAdmin) window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-sm font-semibold tracking-tight">
            <Editable value={meta.brand} onCommit={(brand) => patch('meta', { brand })} />
          </a>
        </div>
        <ul className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={(e) => { e.preventDefault(); go(l.id) }} className="rounded-full px-4 py-2 text-sm text-fg/70 transition-colors hover:bg-white/5 hover:text-fg">
                <Editable value={nav[l.key]} onCommit={(v) => patch('nav', { [l.key]: v })} />
              </a>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full px-3 py-1.5 text-sm text-fg/80 sm:hidden">
          {nav.menu}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} className="glass mx-auto mt-2 max-w-site rounded-3xl p-2 sm:hidden">
            {links.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => go(l.id)} className="w-full rounded-2xl px-4 py-3 text-left text-base text-fg/80 hover:bg-white/5">{nav[l.key]}</button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
