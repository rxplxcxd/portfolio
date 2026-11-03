import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

// Only keys known to the base survive, so stale fields from older saves are dropped
// and new fields added to the defaults appear automatically.
export function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T
  if (isObject(base)) {
    if (!isObject(override)) return base
    const out: Record<string, unknown> = { ...base }
    for (const key of Object.keys(base)) out[key] = deepMerge((base as Record<string, unknown>)[key], override[key])
    return out as T
  }
  if (override === undefined || override === null || typeof override !== typeof base) return base
  return override as T
}

export function hexToRgb(hex: string, fallback = '255 255 255') {
  const m = hex.trim().replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (!/^[0-9a-f]{6}$/i.test(full)) return fallback
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function toEmbedUrl(url: string) {
  const u = url.trim()
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return { kind: 'iframe' as const, src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0` }
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return { kind: 'iframe' as const, src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return { kind: 'video' as const, src: u }
  return { kind: 'iframe' as const, src: u }
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Downscales uploads before they become data URLs; raw camera files would blow past the ~5 MB localStorage quota.
export function fileToDataUrl(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const image = new Image()
      image.onerror = reject
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
