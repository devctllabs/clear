import { iconNames } from 'lucide-react/dynamic'

import {
  createVisualOption,
  type VisualOption,
} from './visualIconTypes'

export const fullVisualOptions: readonly VisualOption[] = iconNames.map((value) =>
  createVisualOption(value),
)
