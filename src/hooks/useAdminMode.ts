import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { verifyPassword } from '../lib/auth'

export type PanelTab = 'general' | 'design' | 'motion' | 'projects' | 'about' | 'contact' | 'data'

interface AdminContext {
  isAdmin: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
  panelOpen: boolean
  setPanelOpen: (v: boolean) => void
  tab: PanelTab
  setTab: (t: PanelTab) => void
  editingProjectId: string | null
  editProject: (id: string | null) => void
}

// Nur für die laufende Browser-Sitzung (Tab schließen = abgemeldet). Wird nie dauerhaft gespeichert.
const SESSION_KEY = 'portfolio:admin-session'
const Ctx = createContext<AdminContext | null>(null)

const clearAdminHash = () => {
  if (window.location.hash === '#/admin') history.replaceState(null, '', window.location.pathname + window.location.search)
}

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      localStorage.removeItem('portfolio:admin') // Altlast aus v1
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })
  const [loginOpen, setLoginOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('general')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const logout = useCallback(() => {
    setIsAdmin(false)
    setPanelOpen(false)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }, [])

  const login = useCallback(async (password: string) => {
    const ok = await verifyPassword(password)
    if (ok) {
      setIsAdmin(true)
      setLoginOpen(false)
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
      clearAdminHash()
    }
    return ok
  }, [])

  const openLogin = useCallback(() => setLoginOpen(true), [])
  const closeLogin = useCallback(() => {
    setLoginOpen(false)
    clearAdminHash()
  }, [])

  const editProject = useCallback((id: string | null) => {
    setEditingProjectId(id)
    if (id) {
      setTab('projects')
      setPanelOpen(true)
    }
  }, [])

  // Versteckte Zugänge: Alt+Shift+A (Desktop) oder die Adresse /#/admin (auch mobil). Beide fragen nach dem Passwort.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyA') (isAdmin ? logout : openLogin)()
    }
    const onHash = () => { if (window.location.hash === '#/admin' && !isAdmin) setLoginOpen(true) }
    onHash()
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
    }
  }, [isAdmin, logout, openLogin])

  useEffect(() => {
    document.documentElement.classList.toggle('is-admin', isAdmin)
  }, [isAdmin])

  const value = useMemo(
    () => ({ isAdmin, login, logout, loginOpen, openLogin, closeLogin, panelOpen, setPanelOpen, tab, setTab, editingProjectId, editProject }),
    [isAdmin, login, logout, loginOpen, openLogin, closeLogin, panelOpen, tab, editingProjectId, editProject],
  )
  return createElement(Ctx.Provider, { value }, children)
}

export function useAdminMode() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminMode muss innerhalb von AdminModeProvider verwendet werden')
  return ctx
}
