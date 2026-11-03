import { motion } from 'framer-motion'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useAdminMode } from '../hooks/useAdminMode'
import Editable from './ui/Editable'
import BlurFade from './ui/BlurFade'
import SpotlightCard from './ui/SpotlightCard'

export default function Contact() {
  const { config, patch } = useSiteConfig()
  const { isAdmin } = useAdminMode()
  const { contact } = config

  return (
    <section id="contact" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <SpotlightCard className="mx-auto max-w-site px-6 py-16 text-center sm:px-12 sm:py-24">
        <Editable value={contact.eyebrow} onCommit={(eyebrow) => patch('contact', { eyebrow })} as="p" className="eyebrow mb-5" />
        <Editable value={contact.title} onCommit={(title) => patch('contact', { title })} as="h2" className="mx-auto max-w-3xl text-h2 font-semibold">
          {(v) => <BlurFade text={v} />}
        </Editable>
        <Editable value={contact.text} onCommit={(text) => patch('contact', { text })} as="p" multiline className="mx-auto mt-6 max-w-xl text-lead text-fg/55" />
        <motion.a
          href={`mailto:${contact.email}`}
          onClick={(e) => isAdmin && e.preventDefault()}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="btn mt-10 bg-accent px-8 py-4 text-base text-bg shadow-[0_0_40px_rgb(var(--accent)/0.35)]"
        >
          <Editable value={contact.cta} onCommit={(cta) => patch('contact', { cta })} />
          <span aria-hidden>↗</span>
        </motion.a>
        <p className="mt-6 text-sm text-fg/50">
          <Editable value={contact.email} onCommit={(email) => patch('contact', { email })} />
        </p>
        <Editable value={contact.note} onCommit={(note) => patch('contact', { note })} as="p" className="mt-2 text-xs text-fg/35" />
      </SpotlightCard>
    </section>
  )
}
