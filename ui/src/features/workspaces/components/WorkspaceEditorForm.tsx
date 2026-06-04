import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { VisualPicker } from '@shared/components/forms/VisualPicker'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

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
}) => (
  <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
    <div className="px-8 pt-8">
      <SectionHeading>Name</SectionHeading>
      <label className="sr-only" htmlFor="workspace-name">
        Workspace name
      </label>
      <textarea
        autoComplete="off"
        className={cn(
          'text-wrap-anywhere type-page-title mt-4 block min-h-20 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/45',
          editorFieldFocusClassName,
        )}
        id="workspace-name"
        name="workspace-name"
        placeholder="Workspace name"
        rows={2}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
      />
    </div>
    <hr className="mx-8 border-t border-border" />
    <div className="px-8 py-8">
      <SectionHeading>Description</SectionHeading>
      <label className="sr-only" htmlFor="workspace-description">
        Workspace description
      </label>
      <textarea
        autoComplete="off"
        className={cn(
          'mt-4 block min-h-36 w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/45',
          editorFieldFocusClassName,
        )}
        id="workspace-description"
        name="workspace-description"
        placeholder="What belongs in this workspace?"
        rows={5}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
    </div>
    <hr className="mx-8 border-t border-border" />
    <div className="px-8 py-8">
      <VisualPicker
        description="Choose a visual anchor for this workspace."
        label="Visual"
        presetOptions={workspacePresetVisualOptions}
        value={icon}
        onValueChange={onIconChange}
      />
    </div>
  </Card>
)
