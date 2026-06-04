import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'

import {
  fallbackVisualIcon,
  type IconGlyphProps,
  type VisualIconName,
} from './visualIconTypes'

const dynamicIconNameSet = new Set<IconName>(iconNames)

const isDynamicVisualIconName = (value: string): value is VisualIconName =>
  dynamicIconNameSet.has(value as IconName)

export const DynamicIconGlyph = ({
  className,
  fallback,
  fallbackName = fallbackVisualIcon,
  name,
}: IconGlyphProps) => (
  <DynamicIcon
    className={className ?? 'size-5 stroke-[2.2]'}
    fallback={fallback}
    name={
      isDynamicVisualIconName(name)
        ? name
        : isDynamicVisualIconName(fallbackName)
          ? fallbackName
          : fallbackVisualIcon
    }
  />
)
