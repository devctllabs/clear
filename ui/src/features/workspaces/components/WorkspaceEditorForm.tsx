import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { FieldValidationMessages } from '@shared/components/forms/FieldValidationMessages'
import { VisualPicker } from '@shared/components/forms/VisualPicker'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'
import { useTranslation } from 'react-i18next'

import { workspacePresetVisualOptions } from '../constants/visuals'

export type WorkspaceEditorValidationMessages = {
  description?: string[]
  icon?: string[]
  title?: string[]
}

export const WorkspaceEditorForm = ({
  description,
  icon,
  onDescriptionChange,
  onIconChange,
  onTitleChange,
  title,
  validationMessages,
}: {
  description: string
  icon: VisualIconName
  onDescriptionChange: (value: string) => void
  onIconChange: (value: VisualIconName) => void
  onTitleChange: (value: string) => void
  title: string
  validationMessages?: WorkspaceEditorValidationMessages
}) => {
  const { t } = useTranslation()
  const titleErrorId = validationMessages?.title?.length
    ? 'workspace-name-error'
    : undefined
  const descriptionErrorId = validationMessages?.description?.length
    ? 'workspace-description-error'
    : undefined
  const iconErrorId = validationMessages?.icon?.length
    ? 'workspace-visual-error'
    : undefined

  return (
    <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="px-8 pt-8">
        <SectionHeading>{t(($) => $.common.labels.name)}</SectionHeading>
        <label className="sr-only" htmlFor="workspace-name">
          {t(($) => $.workspaces.fields.namePlaceholder)}
        </label>
        <textarea
          autoComplete="off"
          aria-describedby={titleErrorId}
          aria-invalid={validationMessages?.title?.length ? true : undefined}
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
        <FieldValidationMessages id={titleErrorId} messages={validationMessages?.title} />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <SectionHeading>{t(($) => $.common.labels.description)}</SectionHeading>
        <label className="sr-only" htmlFor="workspace-description">
          {t(($) => $.workspaces.fields.descriptionLabel)}
        </label>
        <textarea
          autoComplete="off"
          aria-describedby={descriptionErrorId}
          aria-invalid={validationMessages?.description?.length ? true : undefined}
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
        <FieldValidationMessages id={descriptionErrorId} messages={validationMessages?.description} />
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
        <FieldValidationMessages id={iconErrorId} messages={validationMessages?.icon} />
      </div>
    </Card>
  )
}
