// Passwortschutz für den Admin-Modus.
// Im Code steht NICHT das Passwort, sondern nur ein PBKDF2-SHA-256-Hash (150.000 Runden, Salt).
// Hinweis: Eine rein statische Seite hat kein Backend – die Sperre schützt die Bedienoberfläche.
// Änderungen werden ohnehin nur lokal im Browser der Admin-Person gespeichert (localStorage),
// kein Besucher kann Inhalte für andere verändern. Veröffentlicht wird nur über public/content.json.
const SALT = 'ac3c29b574f07077fcc0d1f73b9f9b50'
const HASH = 'c8cbce971c462f5e84339e808a193c7265dc3249d123d3be655a6ea8bccaa4f1'
const ITERATIONS = 150_000

const fromHex = (hex: string) => new Uint8Array((hex.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)))
const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')

export async function verifyPassword(password: string): Promise<boolean> {
  if (!window.crypto?.subtle) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(SALT), iterations: ITERATIONS }, key, 256)
  const a = toHex(bits)
  let diff = a.length ^ HASH.length
  for (let i = 0; i < Math.max(a.length, HASH.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (HASH.charCodeAt(i) || 0)
  return diff === 0
}
