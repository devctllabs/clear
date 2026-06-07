import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import {
  WorkspaceEditorForm,
  type WorkspaceEditorValidationMessages,
} from '../components/WorkspaceEditorForm'
import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { useUpdateWorkspace, useWorkspace } from '../hooks/useWorkspaces'

const createWorkspaceEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    icon: z.custom<VisualIconName>(isVisualIconName, {
      message: requiredFieldMessage(t, t(($) => $.common.labels.visual)),
    }),
    title: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type WorkspaceEditorFormValues = z.infer<ReturnType<typeof createWorkspaceEditorSchema>>

export const WorkspaceEditPage = ({ workspaceId }: { workspaceId: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const workspaceQuery = useWorkspace(workspaceId)
  const updateWorkspace = useUpdateWorkspace(workspaceId)
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
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}`)
  const serviceValidationMessages = updateWorkspace.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          updateWorkspace.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        icon: translateValidationIssuesForPath(
          t,
          updateWorkspace.error,
          ['icon'],
          t(($) => $.common.labels.visual),
        ),
        title: translateValidationIssuesForPath(
          t,
          updateWorkspace.error,
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
    if (updateWorkspace.isError) {
      updateWorkspace.reset()
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

  useEffect(() => {
    if (!workspaceQuery.data) {
      return
    }

    form.reset({
      description: workspaceQuery.data.description,
      icon: workspaceQuery.data.icon,
      title: workspaceQuery.data.title,
    })
  }, [form, workspaceQuery.data])

  if (workspaceQuery.isLoading) {
    return (
      <EditorLoadingState
        backTo={closeTo}
        formKind="workspace"
        title={t(($) => $.workspaces.actions.editWorkspace)}
      />
    )
  }

  if (workspaceQuery.isError && !workspaceQuery.data) {
    return (
      <EditorErrorState
        backTo={closeTo}
        error={workspaceQuery.error}
        errorTitle={t(($) => $.workspaces.errors.workspaceCouldNotLoad)}
        title={t(($) => $.workspaces.actions.editWorkspace)}
        onRetry={() => {
          void workspaceQuery.refetch()
        }}
      />
    )
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.common.actions.saveChanges)}
      actionError={
        updateWorkspace.isError
          ? { error: updateWorkspace.error, title: t(($) => $.workspaces.errors.couldNotSaveWorkspace) }
          : null
      }
      backTo={closeTo}
      isSubmitting={updateWorkspace.isPending}
      title={t(($) => $.workspaces.actions.editWorkspace)}
      onSubmit={form.handleSubmit((values) => {
        updateWorkspace.mutate(
          {
            description: values.description.trim(),
            icon: values.icon,
            title: values.title,
          },
          {
            onSuccess: () => {
              void navigate({ to: '/workspaces' })
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
