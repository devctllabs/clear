import {
  createVisualOption,
  type VisualIconName,
  type VisualOption,
} from '@shared/components/icons/IconGlyph'

export const defaultWorkspaceVisualIcon: VisualIconName = 'layers-3'

export const workspacePresetVisualOptions: readonly VisualOption[] = [
  createVisualOption('layers-3', 'Stack'),
  createVisualOption('archive', 'Archive'),
  createVisualOption('globe', 'Global'),
  createVisualOption('sparkles', 'Sparkles'),
]
