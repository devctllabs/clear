import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { VisualPicker } from '@shared/components/forms/VisualPicker'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'
import { useTranslation } from 'react-i18next'

import { workspacePresetVisualOptions } from '../constants/visuals'

export const WorkspaceEditorForm = ({
  description,
  icon,
  onDescriptionChange,
  onIconChange,
  onTitleChange,
  title,
}: {
  description: string
  icon: VisualIconName
  onDescriptionChange: (value: string) => void
  onIconChange: (value: VisualIconName) => void
  onTitleChange: (value: string) => void
  title: string
}) => {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="px-8 pt-8">
        <SectionHeading>{t(($) => $.common.labels.name)}</SectionHeading>
        <label className="sr-only" htmlFor="workspace-name">
          {t(($) => $.workspaces.fields.namePlaceholder)}
        </label>
        <textarea
          autoComplete="off"
          className={cn(
            'text-wrap-anywhere type-page-title mt-4 block min-h-20 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="workspace-name"
          name="workspace-name"
          placeholder={t(($) => $.workspaces.fields.namePlaceholder)}
          rows={2}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <SectionHeading>{t(($) => $.common.labels.description)}</SectionHeading>
        <label className="sr-only" htmlFor="workspace-description">
          {t(($) => $.workspaces.fields.descriptionLabel)}
        </label>
        <textarea
          autoComplete="off"
          className={cn(
            'mt-4 block min-h-36 w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="workspace-description"
          name="workspace-description"
          placeholder={t(($) => $.workspaces.fields.descriptionPlaceholder)}
          rows={5}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <VisualPicker
          description={t(($) => $.workspaces.descriptions.editorVisual)}
          label={t(($) => $.common.labels.visual)}
          presetOptions={workspacePresetVisualOptions}
          value={icon}
          onValueChange={onIconChange}
        />
      </div>
    </Card>
  )
}
