import type { ReactElement } from 'react'
import type { IconName } from 'lucide-react/dynamic'

export type VisualIconName = IconName

export type VisualOption = Readonly<{
  label: string
  value: VisualIconName
}>

export type IconGlyphFallback = () => ReactElement | null

export type IconGlyphProps = {
  className?: string
  fallback?: IconGlyphFallback
  fallbackName?: VisualIconName
  name: string
}

export const fallbackVisualIcon: VisualIconName = 'circle-help'

export const normalizeVisualIconLabel = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const createVisualOption = (
  value: VisualIconName,
  label = normalizeVisualIconLabel(value),
): VisualOption => ({
  label,
  value,
})
