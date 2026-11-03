import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaults, emptyProject, emptyTool } from '../data/defaults'
import { deepMerge, hexToRgb } from '../lib/utils'
import type { SiteConfig } from '../types'

export const STORAGE_KEY = 'portfolio:content:v2'

function normalize(raw: unknown): SiteConfig {
  const merged = deepMerge(defaults, raw)
  return {
    ...merged,
    work: { ...merged.work, projects: merged.work.projects.map((p) => deepMerge(emptyProject, p)) },
    about: { ...merged.about, tools: merged.about.tools.map((t) => deepMerge(emptyTool, t)) },
  }
}

function readStored(): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

interface SiteConfigContext {
  config: SiteConfig
  ready: boolean
  saveError: string | null
  hasLocalChanges: boolean
  setConfig: (next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void
  patch: <K extends keyof SiteConfig>(section: K, value: Partial<SiteConfig[K]>) => void
  reset: () => void
  importConfig: (json: string) => void
  exportConfig: () => string
}

const Ctx = createContext<SiteConfigContext | null>(null)

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<unknown>(undefined)
  const [config, setConfigState] = useState<SiteConfig>(() => normalize(readStored()))
  const [hasLocalChanges, setHasLocalChanges] = useState(() => readStored() !== undefined)
  const [ready, setReady] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Optional /content.json (exported from the admin panel) is the published baseline for every visitor;
  // local edits from the admin browser still win on top of it.
  useEffect(() => {
    let alive = true
    const done = () => alive && setReady(true)
    fetch(`${import.meta.env.BASE_URL}content.json`, { cache: 'no-store' })
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : undefined))
      .then((data) => {
        if (!alive || !data) return
        setPublished(data)
        const stored = readStored()
        setConfigState(normalize(stored ? deepMerge(normalize(data), stored) : data))
      })
      .catch(() => undefined)
      .finally(done)
    const t = window.setTimeout(done, 1200)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [])

  const persist = useCallback((next: SiteConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSaveError(null)
      setHasLocalChanges(true)
    } catch {
      setSaveError('Speicher voll – bitte Bilder als URL statt Upload einbinden.')
    }
  }, [])

  const setConfig = useCallback<SiteConfigContext['setConfig']>(
    (next) =>
      setConfigState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next
        persist(value)
        return value
      }),
    [persist],
  )

  const patch = useCallback<SiteConfigContext['patch']>(
    (section, value) => setConfig((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...value } })),
    [setConfig],
  )

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHasLocalChanges(false)
    setSaveError(null)
    setConfigState(normalize(published))
  }, [published])

  const importConfig = useCallback((json: string) => setConfig(normalize(JSON.parse(json))), [setConfig])
  const exportConfig = useCallback(() => JSON.stringify(config, null, 2), [config])

  useEffect(() => {
    const root = document.documentElement.style
    const { theme } = config
    root.setProperty('--bg', hexToRgb(theme.background, '5 5 7'))
    root.setProperty('--fg', hexToRgb(theme.foreground, '245 245 247'))
    root.setProperty('--accent', hexToRgb(theme.accent, '139 124 255'))
    root.setProperty('--glow1', hexToRgb(theme.glowPrimary, '91 75 255'))
    root.setProperty('--glow2', hexToRgb(theme.glowSecondary, '0 179 255'))
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background)
  }, [config])

  useEffect(() => {
    document.title = config.meta.documentTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', config.meta.description)
  }, [config.meta])

  const value = useMemo(
    () => ({ config, ready, saveError, hasLocalChanges, setConfig, patch, reset, importConfig, exportConfig }),
    [config, ready, saveError, hasLocalChanges, setConfig, patch, reset, importConfig, exportConfig],
  )
  return createElement(Ctx.Provider, { value }, children)
}

export function useSiteConfig() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSiteConfig muss innerhalb von SiteConfigProvider verwendet werden')
  return ctx
}
