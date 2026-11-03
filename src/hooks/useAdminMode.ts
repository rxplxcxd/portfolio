import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type PanelTab = 'general' | 'design' | 'motion' | 'projects' | 'about' | 'contact' | 'data'

interface AdminContext {
  isAdmin: boolean
  toggleAdmin: () => void
  setAdmin: (v: boolean) => void
  panelOpen: boolean
  setPanelOpen: (v: boolean) => void
  tab: PanelTab
  setTab: (t: PanelTab) => void
  editingProjectId: string | null
  editProject: (id: string | null) => void
}

const ADMIN_KEY = 'portfolio:admin'
const Ctx = createContext<AdminContext | null>(null)

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (new URLSearchParams(window.location.search).has('admin')) return true
    return localStorage.getItem(ADMIN_KEY) === '1'
  })
  const [panelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('general')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const setAdmin = useCallback((v: boolean) => {
    setIsAdmin(v)
    localStorage.setItem(ADMIN_KEY, v ? '1' : '0')
    if (!v) setPanelOpen(false)
  }, [])
  const toggleAdmin = useCallback(() => setAdmin(!isAdmin), [isAdmin, setAdmin])
  const editProject = useCallback((id: string | null) => {
    setEditingProjectId(id)
    if (id) {
      setTab('projects')
      setPanelOpen(true)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyA') toggleAdmin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleAdmin])

  useEffect(() => {
    document.documentElement.classList.toggle('is-admin', isAdmin)
  }, [isAdmin])

  const value = useMemo(
    () => ({ isAdmin, toggleAdmin, setAdmin, panelOpen, setPanelOpen, tab, setTab, editingProjectId, editProject }),
    [isAdmin, toggleAdmin, setAdmin, panelOpen, tab, editingProjectId, editProject],
  )
  return createElement(Ctx.Provider, { value }, children)
}

export function useAdminMode() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminMode muss innerhalb von AdminModeProvider verwendet werden')
  return ctx
}
