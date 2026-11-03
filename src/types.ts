export type MediaType = 'video' | 'gallery'

export interface Project {
  id: string
  title: string
  category: string
  year: string
  role: string
  client: string
  summary: string
  description: string
  tags: string[]
  thumbnail: string
  accent: string
  mediaType: MediaType
  videoUrl: string
  images: string[]
}

export interface Tool {
  id: string
  name: string
  short: string
  category: string
  level: number
  years: string
  color: string
}

export interface SocialLink {
  id: string
  label: string
  url: string
}

export interface Fact {
  label: string
  value: string
}

export interface ThemeConfig {
  background: string
  foreground: string
  accent: string
  glowPrimary: string
  glowSecondary: string
}

export interface AnimationConfig {
  scramble: boolean
  scrambleDuration: number
  scrambleSpeed: number
  scrambleCharset: string
  wordInterval: number
  blurFade: boolean
  blurFadeDuration: number
  blurFadeStagger: number
  spotlight: boolean
  spotlightSize: number
  spotlightOpacity: number
  springStiffness: number
  springDamping: number
  ambientGlows: boolean
  glowDrift: boolean
  scrollIndicator: boolean
}

export interface SectionsConfig {
  work: boolean
  about: boolean
  tools: boolean
  contact: boolean
}

export interface SiteConfig {
  meta: { documentTitle: string; description: string; brand: string }
  theme: ThemeConfig
  animations: AnimationConfig
  sections: SectionsConfig
  nav: { work: string; about: string; contact: string; menu: string }
  hero: {
    eyebrow: string
    headlinePrefix: string
    words: string[]
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
    scrollHint: string
  }
  work: {
    eyebrow: string
    title: string
    intro: string
    allLabel: string
    categories: string[]
    emptyText: string
    projects: Project[]
    labels: { role: string; year: string; client: string; close: string; play: string; noVideo: string; open: string }
  }
  about: {
    eyebrow: string
    title: string
    bio: string[]
    name: string
    role: string
    location: string
    availability: string
    avatar: string
    initials: string
    facts: Fact[]
    toolsTitle: string
    toolsIntro: string
    tools: Tool[]
  }
  contact: { eyebrow: string; title: string; text: string; cta: string; email: string; note: string }
  footer: { copyright: string; impressumLabel: string; impressumUrl: string; privacyLabel: string; privacyUrl: string; note: string }
  socials: SocialLink[]
}
