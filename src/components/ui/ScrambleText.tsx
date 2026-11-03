import type { ElementType } from 'react'
import { createElement } from 'react'
import { useScramble } from '../../hooks/useScramble'
import { useSiteConfig } from '../../hooks/useSiteConfig'

interface Props {
  text: string
  as?: ElementType
  className?: string
  decodeOnMount?: boolean
}

export default function ScrambleText({ text, as = 'span', className, decodeOnMount = true }: Props) {
  const { animations: a } = useSiteConfig().config
  const output = useScramble(text, {
    enabled: a.scramble,
    duration: a.scrambleDuration,
    speed: a.scrambleSpeed,
    charset: a.scrambleCharset,
    decodeOnMount,
  })
  return createElement(as, { className, 'aria-label': text }, <span aria-hidden>{output || '\u00a0'}</span>)
}
