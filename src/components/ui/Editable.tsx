import { createElement, type ElementType, type KeyboardEvent, type ReactNode } from 'react'
import { useAdminMode } from '../../hooks/useAdminMode'

interface Props {
  value: string
  onCommit: (value: string) => void
  as?: ElementType
  className?: string
  multiline?: boolean
  children?: (value: string) => ReactNode
}

export default function Editable({ value, onCommit, as = 'span', className, multiline, children }: Props) {
  const { isAdmin } = useAdminMode()
  if (!isAdmin) return createElement(as, { className }, children ? children(value) : value)

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.textContent = value
      e.currentTarget.blur()
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  return createElement(
    as,
    {
      key: value,
      className,
      'data-editable': '',
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      title: 'Klicken zum Bearbeiten',
      onClick: (e: { preventDefault: () => void; stopPropagation: () => void }) => {
        e.preventDefault()
        e.stopPropagation()
      },
      onKeyDown,
      onBlur: (e: { currentTarget: HTMLElement }) => {
        const next = (multiline ? e.currentTarget.innerText : e.currentTarget.textContent ?? '').trim()
        if (next !== value) onCommit(next)
      },
    },
    value,
  )
}
