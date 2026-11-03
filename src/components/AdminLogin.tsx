import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdminMode } from '../hooks/useAdminMode'

export default function AdminLogin() {
  const { loginOpen, closeLogin, login } = useAdminMode()
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fails, setFails] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loginOpen) return
    setPw('')
    setError('')
    const t = window.setTimeout(() => input.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLogin()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [loginOpen, closeLogin])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || !pw) return
    setBusy(true)
    setError('')
    const ok = await login(pw)
    if (!ok) {
      const n = fails + 1
      setFails(n)
      await new Promise((r) => setTimeout(r, Math.min(500 * 2 ** n, 8000))) // Bremse gegen Durchprobieren
      setError(window.crypto?.subtle ? 'Falsches Passwort.' : 'Anmeldung nur über HTTPS möglich.')
      setPw('')
    }
    setBusy(false)
  }

  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeLogin} />
          <motion.form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-label="Admin-Anmeldung"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="glass relative w-full max-w-sm space-y-4 rounded-3xl bg-bg/80 p-7"
          >
            <h2 className="text-lg font-semibold">Admin-Anmeldung</h2>
            <input
              ref={input}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              placeholder="Passwort"
              aria-label="Passwort"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <p className="min-h-[1.25rem] text-xs text-red-400" role="alert">{error}</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeLogin} className="rounded-full border border-white/15 px-4 py-2 text-sm text-fg/80 hover:bg-white/5">Abbrechen</button>
              <button type="submit" disabled={busy} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-bg disabled:opacity-60">{busy ? 'Prüfe …' : 'Anmelden'}</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
