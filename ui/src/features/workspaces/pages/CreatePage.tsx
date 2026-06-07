import { useNavigate } from '@tanstack/react-router'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import { z } from 'zod'

import {
  isVisualIconName,
  type VisualIconName,
} from '@shared/components/icons/IconGlyph'
import {
  fieldErrorMessages,
  mergeFieldValidationMessages,
  requiredFieldMessage,
  requiredTrimmedText,
} from '@shared/components/forms/validation'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import {
  WorkspaceEditorForm,
  type WorkspaceEditorValidationMessages,
} from '../components/WorkspaceEditorForm'
import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { useCreateWorkspace } from '../hooks/useWorkspaces'

const createWorkspaceEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    icon: z.custom<VisualIconName>(isVisualIconName, {
      message: requiredFieldMessage(t, t(($) => $.common.labels.visual)),
    }),
    title: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type WorkspaceEditorFormValues = z.infer<ReturnType<typeof createWorkspaceEditorSchema>>

export const WorkspaceCreatePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createWorkspace = useCreateWorkspace()
  const form = useForm<WorkspaceEditorFormValues>({
    defaultValues: {
      description: '',
      icon: defaultWorkspaceVisualIcon,
      title: '',
    },
    resolver: zodResolver(createWorkspaceEditorSchema(t), undefined, { mode: 'sync' }),
  })
  const title = useController({ control: form.control, name: 'title' })
  const description = useController({ control: form.control, name: 'description' })
  const icon = useController({ control: form.control, name: 'icon' })
  const closeTo = useCloseTarget('/workspaces')
  const serviceValidationMessages = createWorkspace.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          createWorkspace.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        icon: translateValidationIssuesForPath(
          t,
          createWorkspace.error,
          ['icon'],
          t(($) => $.common.labels.visual),
        ),
        title: translateValidationIssuesForPath(
          t,
          createWorkspace.error,
          ['title'],
          t(($) => $.common.labels.name),
        ),
      }
    : undefined
  const formValidationMessages: WorkspaceEditorValidationMessages = {
    description: fieldErrorMessages(form.formState.errors.description),
    icon: fieldErrorMessages(form.formState.errors.icon),
    title: fieldErrorMessages(form.formState.errors.title),
  }
  const validationMessages = mergeFieldValidationMessages(
    serviceValidationMessages,
    formValidationMessages,
  )

  const resetMutationError = () => {
    if (createWorkspace.isError) {
      createWorkspace.reset()
    }
  }

  const handleTitleChange = (nextTitle: string) => {
    resetMutationError()
    if (nextTitle.trim().length > 0) {
      form.clearErrors('title')
    }
    title.field.onChange(nextTitle)
  }

  const handleDescriptionChange = (nextDescription: string) => {
    resetMutationError()
    description.field.onChange(nextDescription)
  }

  const handleIconChange = (nextIcon: VisualIconName) => {
    resetMutationError()
    icon.field.onChange(nextIcon)
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.workspaces.actions.createWorkspace)}
      actionError={
        createWorkspace.isError
          ? { error: createWorkspace.error, title: t(($) => $.workspaces.errors.couldNotCreateWorkspace) }
          : null
      }
      backTo={closeTo}
      isSubmitting={createWorkspace.isPending}
      title={t(($) => $.workspaces.labels.createWorkspaceTitle)}
      onSubmit={form.handleSubmit((values) => {
        createWorkspace.mutate(
          {
            description: values.description.trim(),
            icon: values.icon,
            title: values.title,
          },
          {
            onSuccess: (workspace) => {
              void navigate({
                params: { workspaceId: workspace.id },
                to: '/dashboard/$workspaceId',
              })
            },
          },
        )
      })}
    >
      <WorkspaceEditorForm
        description={description.field.value}
        icon={icon.field.value}
        title={title.field.value}
        validationMessages={validationMessages}
        onDescriptionChange={handleDescriptionChange}
        onIconChange={handleIconChange}
        onTitleChange={handleTitleChange}
      />
    </EditorShell>
  )
}
