# Portfolio – Leon Schubert

Bewerbungsportfolio (Mediengestalter Digital) mit React 18, TypeScript, Tailwind CSS, Framer Motion und Vite.
Alle Inhalte, Farben und Animationen lassen sich im Browser über den Admin-Modus ändern.

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal testen
```

## Admin-Modus

- Aktivieren: kleiner Punkt links neben dem Namen in der Navigation, Tastenkürzel **Alt + Shift + A** oder URL mit `?admin`.
- Gestrichelt umrandete Texte direkt anklicken und bearbeiten (Enter oder Klick daneben speichert, Esc verwirft).
- **Panel öffnen** (Admin-Leiste oben) für alles Weitere:
  - **Allgemein:** Browser-Titel, SEO-Beschreibung, Name, Hero-Texte, animierte Scramble-Wörter, Buttons, Navigation, Sektionen ein/aus
  - **Design:** Farbvorlagen, Hintergrund, Text, Akzent, beide Glow-Farben, Glows/Drift
  - **Animation:** Scramble (Dauer, Tempo, Wortwechsel, Zeichen), Blur-Fade, Spotlight (Größe, Intensität), Federung
  - **Projekte:** anlegen, bearbeiten, sortieren, löschen; Kategorien/Filter; Video-URL (YouTube/Vimeo/MP4) oder Bild-Galerie; Bild-Upload
  - **Über mich:** Profil, Foto, Bio-Absätze, Steckbrief, Werkzeuge mit Skill-Level
  - **Kontakt:** Texte, E-Mail, Social Links, Footer/Impressum
  - **Daten:** Export/Import als `content.json`, Zurücksetzen

### Änderungen veröffentlichen

Änderungen werden im `localStorage` (`portfolio:content:v1`) **nur in deinem Browser** gespeichert.
Damit alle Besucher sie sehen:

1. Admin-Panel → **Daten** → **content.json exportieren**
2. Datei nach `public/content.json` legen
3. Neu bauen/deployen

Beim Laden gilt: Standardwerte (`src/data/defaults.ts`) → `public/content.json` → lokale Änderungen.

Tipp: Für viele große Bilder lieber Dateien nach `public/media/` legen und als `/media/datei.jpg` eintragen –
hochgeladene Bilder werden verkleinert als Data-URL gespeichert, der Browser-Speicher ist auf ca. 5 MB begrenzt.

## Deployment auf `portfolio.ithilfeschubert.xyz`

Die Haupt-Domain und bestehende Server bleiben unberührt – es wird nur ein DNS-Eintrag für die Subdomain ergänzt.

### Vercel
1. Projekt zu GitHub pushen, auf vercel.com importieren (Framework: Vite, Build: `npm run build`, Output: `dist`).
2. Projekt → Settings → Domains → `portfolio.ithilfeschubert.xyz` hinzufügen.
3. Beim DNS-Anbieter: `CNAME  portfolio  cname.vercel-dns.com`

### Netlify
1. Repository verbinden (Build: `npm run build`, Publish: `dist`) oder `dist/` per Drag & Drop hochladen.
2. Domain settings → Custom domain → `portfolio.ithilfeschubert.xyz`.
3. Beim DNS-Anbieter: `CNAME  portfolio  <dein-projekt>.netlify.app`

### Eigener Webserver
`dist/` in ein eigenes Verzeichnis (z. B. `/var/www/portfolio`) kopieren, einen separaten vHost für die Subdomain anlegen
und per DNS (`A`- oder `CNAME`-Eintrag `portfolio`) auf den Server zeigen lassen. HTTPS z. B. via Let's Encrypt.

DNS-Änderungen brauchen meist wenige Minuten bis einige Stunden.

## Struktur

```
src/
  types.ts              SiteConfig und alle Typen
  data/defaults.ts      Standardinhalte
  hooks/                useSiteConfig, useAdminMode, useScramble, useSpotlight
  components/           Nav, AdminBar, AdminPanel, Hero, WorkGrid, ProjectCard, ProjectModal, About, Contact, Footer
  components/ui/        ScrambleText, BlurFade, SpotlightCard, Editable
```

Impressum und Datenschutzerklärung vor Veröffentlichung im Admin-Panel (Kontakt → Footer) verlinken.
