import { AnimatePresence, motion } from 'framer-motion'
import { useAdminMode } from '../hooks/useAdminMode'
import { useSiteConfig } from '../hooks/useSiteConfig'

export default function AdminBar() {
  const { isAdmin, setAdmin, panelOpen, setPanelOpen } = useAdminMode()
  const { saveError, hasLocalChanges } = useSiteConfig()

  return (
    <AnimatePresence>
      {isAdmin && (
        <motion.div initial={{ y: -48 }} animate={{ y: 0 }} exit={{ y: -48 }} className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center justify-between gap-3 border-b border-accent/30 bg-bg/85 px-4 text-xs backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
            <span className="font-medium text-fg">Admin-Modus</span>
            <span className={`hidden truncate sm:inline ${saveError ? 'text-red-400' : 'text-fg/50'}`}>
              {saveError ?? (hasLocalChanges ? '· Änderungen lokal gespeichert · gestrichelte Texte anklicken zum Bearbeiten' : '· gestrichelte Texte anklicken zum Bearbeiten')}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setPanelOpen(!panelOpen)} className="rounded-full bg-accent px-3 py-1 font-medium text-bg">{panelOpen ? 'Panel schließen' : 'Panel öffnen'}</button>
            <button type="button" onClick={() => setAdmin(false)} className="rounded-full border border-white/15 px-3 py-1 text-fg/80 hover:bg-white/5">Beenden</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
