import {
  createVisualOption,
  type VisualIconName,
  type VisualOption,
} from '@shared/components/icons/IconGlyph'

export const defaultDeckVisualIcon: VisualIconName = 'brain'

export const deckPresetVisualOptions: readonly VisualOption[] = [
  createVisualOption('brain', 'Brain'),
  createVisualOption('languages', 'Language'),
  createVisualOption('shapes', 'Architecture'),
  createVisualOption('sparkles', 'Sparkles'),
  createVisualOption('graduation-cap', 'Graduation'),
  createVisualOption('flask-conical', 'Lab'),
]

export const deckVisualIconOptions = deckPresetVisualOptions.map((option) => option.value)
