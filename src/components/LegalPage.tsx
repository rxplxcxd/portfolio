import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { legal, hasPlaceholders } from '../data/legal'
import { useAdminMode } from '../hooks/useAdminMode'
import { goHome } from '../lib/utils'

export type LegalKind = 'impressum' | 'datenschutz'

const H = ({ children }: { children: ReactNode }) => <h2 className="mt-10 text-xl font-semibold tracking-tight text-fg">{children}</h2>
const P = ({ children }: { children: ReactNode }) => <p className="mt-3">{children}</p>

function Impressum() {
  return (
    <>
      <h1 className="text-h2 font-semibold">Impressum</h1>
      <H>Angaben gemäß § 5 DDG</H>
      <P>
        {legal.name}<br />
        {legal.street}<br />
        {legal.zip} {legal.city}<br />
        {legal.country}
      </P>
      <H>Kontakt</H>
      <P>
        E-Mail: <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${legal.email}`}>{legal.email}</a>
        {legal.phone && <><br />Telefon: {legal.phone}</>}
      </P>
      <H>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H>
      <P>{legal.name}, Anschrift wie oben.</P>
      <H>Haftung für Inhalte</H>
      <P>Als Diensteanbieter bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich; bei Bekanntwerden entsprechender Rechtsverletzungen entferne ich diese Inhalte umgehend.</P>
      <H>Haftung für Links</H>
      <P>Diese Seite enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte kann ich keine Gewähr übernehmen; verantwortlich ist stets der jeweilige Anbieter. Bei Bekanntwerden von Rechtsverletzungen entferne ich derartige Links umgehend.</P>
      <H>Urheberrecht</H>
      <P>Die auf dieser Seite gezeigten Arbeiten und Texte unterliegen dem deutschen Urheberrecht. Eine Vervielfältigung, Bearbeitung oder Verbreitung außerhalb der Grenzen des Urheberrechts bedarf der schriftlichen Zustimmung des jeweiligen Urhebers.</P>
    </>
  )
}

function Datenschutz() {
  return (
    <>
      <h1 className="text-h2 font-semibold">Datenschutzerklärung</h1>
      <H>1. Verantwortlicher</H>
      <P>
        {legal.name}, {legal.street}, {legal.zip} {legal.city}, {legal.country}<br />
        E-Mail: <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${legal.email}`}>{legal.email}</a>
      </P>
      <H>2. Hosting und Server-Logfiles</H>
      <P>Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf werden technisch notwendige Daten verarbeitet, insbesondere IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser- und Betriebssysteminformationen. Die Verarbeitung dient dem sicheren und stabilen Betrieb der Seite (Art. 6 Abs. 1 lit. f DSGVO). Eine Datenübermittlung in die USA ist dabei möglich; sie stützt sich auf die EU-Standardvertragsklauseln bzw. das EU-US Data Privacy Framework des Anbieters.</P>
      <H>3. Keine Cookies, kein Tracking</H>
      <P>Diese Seite setzt keine Cookies und verwendet keine Analyse-, Tracking- oder Werbedienste. Schriften werden lokal vom eigenen Server geladen, nicht von Google Fonts. Für Besucher werden keine Daten im Browser gespeichert.</P>
      <H>4. Kontaktaufnahme per E-Mail</H>
      <P>Wenn du mir schreibst, verarbeite ich deine Angaben (E-Mail-Adresse, Nachrichtentext) zur Bearbeitung deiner Anfrage bzw. Bewerbung (Art. 6 Abs. 1 lit. b und f DSGVO). Die Daten lösche ich, sobald sie für den Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</P>
      <H>5. Eingebettete Videos</H>
      <P>Videos von YouTube (Google Ireland Limited, Datenschutzmodus „youtube-nocookie.com“) oder Vimeo werden erst nach deinem Klick auf „Video abspielen“ geladen. Erst dann wird eine Verbindung zum jeweiligen Anbieter hergestellt und dessen Datenschutzerklärung ist maßgeblich (Art. 6 Abs. 1 lit. a DSGVO, Einwilligung durch Klick).</P>
      <H>6. Externe Links</H>
      <P>Links zu Instagram, Behance, LinkedIn o. Ä. sind einfache Verweise. Erst wenn du sie anklickst, werden Daten an den jeweiligen Anbieter übermittelt.</P>
      <H>7. Deine Rechte</H>
      <P>Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Zudem hast du das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren, z. B. bei: {legal.authority}.</P>
      <p className="mt-10 text-xs text-fg/40">Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</p>
    </>
  )
}

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { isAdmin } = useAdminMode()
  useEffect(() => { window.scrollTo(0, 0) }, [kind])

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto min-h-[70svh] max-w-3xl px-5 pb-24 pt-32 text-sm leading-relaxed text-fg/65 sm:px-8">
      <a href="./" onClick={(e) => { e.preventDefault(); goHome() }} className="mb-8 inline-block text-fg/60 hover:text-fg">← Zur Startseite</a>
      {isAdmin && hasPlaceholders() && (
        <p className="mb-8 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-xs text-red-300">
          Admin-Hinweis: In <code>src/data/legal.ts</code> stehen noch Platzhalter in [eckigen Klammern]. Vor der Veröffentlichung durch echte Angaben ersetzen.
        </p>
      )}
      {kind === 'impressum' ? <Impressum /> : <Datenschutz />}
    </motion.article>
  )
}
