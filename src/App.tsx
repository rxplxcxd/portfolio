import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSiteConfig } from './hooks/useSiteConfig'
import { useAdminMode } from './hooks/useAdminMode'
import { cn } from './lib/utils'
import AdminBar from './components/AdminBar'
import AdminPanel from './components/AdminPanel'
import Nav from './components/Nav'
import Hero from './components/Hero'
import WorkGrid from './components/WorkGrid'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminLogin from './components/AdminLogin'
import LegalPage, { type LegalKind } from './components/LegalPage'

const routeFromHash = (): LegalKind | null => {
  const h = window.location.hash
  return h === '#/impressum' ? 'impressum' : h === '#/datenschutz' ? 'datenschutz' : null
}

export default function App() {
  const { config, ready } = useSiteConfig()
  const { isAdmin } = useAdminMode()
  const { animations: a, sections } = config
  const [legalPage, setLegalPage] = useState<LegalKind | null>(routeFromHash)
  useEffect(() => {
    const onHash = () => setLegalPage(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: a.springStiffness, damping: a.springDamping }}>
      {a.ambientGlows && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className={cn('absolute -left-[20%] -top-[25%] h-[70vmax] w-[70vmax] rounded-full opacity-[0.22] blur-3xl', a.glowDrift && 'animate-drift')}
            style={{ background: 'radial-gradient(circle, rgb(var(--glow1)) 0%, transparent 62%)' }} />
          <div className={cn('absolute -bottom-[30%] -right-[20%] h-[65vmax] w-[65vmax] rounded-full opacity-[0.16] blur-3xl', a.glowDrift && 'animate-drift [animation-delay:-11s]')}
            style={{ background: 'radial-gradient(circle, rgb(var(--glow2)) 0%, transparent 62%)' }} />
        </div>
      )}
      <AdminBar />
      <Nav />
      <main className={cn('transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0', isAdmin && 'pt-10')}>
        {legalPage ? (
          <LegalPage kind={legalPage} />
        ) : (
          <>
            <Hero />
            {sections.work && <WorkGrid />}
            {(sections.about || sections.tools) && <About />}
            {sections.contact && <Contact />}
          </>
        )}
      </main>
      <Footer />
      <AdminPanel />
      <AdminLogin />
    </MotionConfig>
  )
}
