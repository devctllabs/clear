import { lazy, Suspense } from 'react'
import {
  Archive,
  BookOpen,
  Brain,
  CircleHelp,
  FlaskConical,
  Globe,
  GraduationCap,
  Languages,
  Layers3,
  Settings,
  Shapes,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import {
  fallbackVisualIcon,
  type IconGlyphProps,
  type VisualIconName,
} from './visualIconTypes'

export {
  createVisualOption,
  fallbackVisualIcon,
  normalizeVisualIconLabel,
} from './visualIconTypes'
export type {
  IconGlyphFallback,
  IconGlyphProps,
  VisualIconName,
  VisualOption,
} from './visualIconTypes'

const DynamicIconGlyph = lazy(() =>
  import('./IconGlyphDynamic').then((module) => ({
    default: module.DynamicIconGlyph,
  })),
)

const curatedVisualIcons: Partial<Record<string, LucideIcon>> = {
  archive: Archive,
  'book-open': BookOpen,
  brain: Brain,
  'circle-help': CircleHelp,
  'flask-conical': FlaskConical,
  globe: Globe,
  'graduation-cap': GraduationCap,
  languages: Languages,
  'layers-3': Layers3,
  settings: Settings,
  shapes: Shapes,
  sparkles: Sparkles,
}

export const isVisualIconName = (value: unknown): value is VisualIconName =>
  typeof value === 'string' && value in curatedVisualIcons

export const IconGlyphLoadingFallback = () => (
  <span
    aria-hidden="true"
    className="loading-shimmer block size-5 rounded-full"
  />
)

export const IconGlyph = ({
  className,
  fallback,
  fallbackName = fallbackVisualIcon,
  name,
}: IconGlyphProps) => {
  const resolvedClassName = className ?? 'size-5 stroke-[2.2]'
  const CuratedIcon = curatedVisualIcons[name as VisualIconName]

  if (CuratedIcon) {
    return <CuratedIcon className={resolvedClassName} />
  }

  return (
    <Suspense fallback={fallback?.() ?? null}>
      <DynamicIconGlyph
        className={resolvedClassName}
        fallback={fallback}
        fallbackName={fallbackName}
        name={name}
      />
    </Suspense>
  )
}

export const LazyIconGlyph = (props: Omit<IconGlyphProps, 'fallback'>) => (
  <IconGlyph {...props} fallback={IconGlyphLoadingFallback} />
)
