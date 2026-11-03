import { useSiteConfig } from '../hooks/useSiteConfig'
import Editable from './ui/Editable'

export default function Footer() {
  const { config, patch } = useSiteConfig()
  const { footer, socials } = config

  return (
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-site flex-col gap-6 text-sm text-fg/50 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p>{footer.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
          <Editable value={footer.note} onCommit={(note) => patch('footer', { note })} as="p" className="text-xs text-fg/35" />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">{s.label}</a>
            </li>
          ))}
        </ul>
        <div className="flex gap-5">
          <a href={footer.impressumUrl} className="hover:text-fg">{footer.impressumLabel}</a>
          <a href={footer.privacyUrl} className="hover:text-fg">{footer.privacyLabel}</a>
        </div>
      </div>
    </footer>
  )
}
