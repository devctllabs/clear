import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { EmptyState } from '@shared/components/feedback/EmptyState'
import {
  BottomActionErrorStatus,
  bottomStatusContentPaddingClassName,
  desktopBottomStatusStackClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { Button } from '@shared/components/ui/button'
import {
  responsiveActionButtonClassName,
} from '@shared/components/ui/responsive-action'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { createOpenedFromState } from '@shared/lib/navigation-state'

import { WorkspaceListLoadingState } from '../components/WorkspaceListLoadingState'
import {
  type WorkspaceCardDensity,
  WorkspaceSpaceCard,
} from '../components/WorkspaceSpaceCard'
import {
  useDeleteWorkspace,
  useSetActiveWorkspace,
  useWorkspaces,
} from '../hooks/useWorkspaces'
import type { Workspace } from '../types/workspace.types'

const workspaceListDesktopGridClassName = 'grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'

export const WorkspaceListPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const workspacesQuery = useWorkspaces()
  const setActiveWorkspace = useSetActiveWorkspace()
  const deleteWorkspace = useDeleteWorkspace()
  const [pendingDelete, setPendingDelete] = useState<Workspace | null>(null)
  const [pendingOpenWorkspaceId, setPendingOpenWorkspaceId] = useState<string | null>(null)
  const activeWorkspaceId = workspacesQuery.data?.activeWorkspaceId
  const homeTarget = activeWorkspaceId ? { to: `/dashboard/${activeWorkspaceId}` } : { to: '/workspaces' }
  const isDesktop = useIsDesktopLayout()
  const showInitialLoading = useDelayedBoolean(workspacesQuery.isLoading, 180)
  const showOpenPending = useDelayedBoolean(setActiveWorkspace.isPending, 250)
  const workspaces = workspacesQuery.data?.workspaces ?? []
  const isWorkspaceListEmpty = workspacesQuery.data !== undefined && workspaces.length === 0
  const openCreateWorkspace = () => {
    void navigate({
      state: createOpenedFromState('/workspaces'),
      to: '/workspaces/new',
    })
  }
  const openDeleteWorkspaceDialog = (workspace: Workspace) => {
    deleteWorkspace.reset()
    setPendingDelete(workspace)
  }
  const closeDeleteWorkspaceDialog = () => {
    setPendingDelete(null)
    deleteWorkspace.reset()
  }

  const renderWorkspaceCards = (density: WorkspaceCardDensity) => (
    <>
      {workspaces.map((workspace) => (
        <WorkspaceSpaceCard
          active={workspace.id === activeWorkspaceId}
          density={density}
          key={workspace.id}
          opening={showOpenPending && pendingOpenWorkspaceId === workspace.id}
          workspace={workspace}
          onDelete={openDeleteWorkspaceDialog}
          onEdit={(workspaceId) => {
            void navigate({
              params: { workspaceId },
              state: createOpenedFromState('/workspaces'),
              to: '/workspaces/$workspaceId/edit',
            })
          }}
          onOpen={(workspaceId) => {
            if (setActiveWorkspace.isPending) {
              return
            }

            setPendingOpenWorkspaceId(workspaceId)
            setActiveWorkspace.mutate(workspaceId, {
              onSuccess: () => {
                void navigate({
                  params: { workspaceId },
                  to: '/dashboard/$workspaceId',
                })
              },
              onSettled: () => {
                setPendingOpenWorkspaceId(null)
              },
            })
          }}
        />
      ))}
    </>
  )
  const emptyState = (
    <EmptyState
      actions={[
        {
          icon: <Plus className="size-4" />,
          label: t(($) => $.workspaces.actions.createWorkspace),
          onClick: openCreateWorkspace,
        },
      ]}
      description={t(($) => $.workspaces.descriptions.emptyList)}
      icon={<Plus className="size-6" />}
      title={t(($) => $.workspaces.empty.startWithWorkspace)}
    />
  )
  const viewProps: WorkspaceListPageViewProps = workspacesQuery.isLoading
    ? {
        homeTarget,
        showSkeleton: showInitialLoading,
        state: 'loading',
      }
    : workspacesQuery.isError && workspacesQuery.data === undefined
      ? {
          error: workspacesQuery.error,
          homeTarget,
          onRetry: () => {
            void workspacesQuery.refetch()
          },
          state: 'workspaces-error',
        }
      : {
          content: renderWorkspaceCards('regular'),
          emptyState: isWorkspaceListEmpty ? emptyState : null,
          hasBottomStatus: setActiveWorkspace.isError,
          homeTarget,
          mobileContent: renderWorkspaceCards('compact'),
          showCreateAction: !isWorkspaceListEmpty,
          state: 'loaded',
          onCreateWorkspace: openCreateWorkspace,
        }

  const page = isDesktop ? (
    <WorkspaceListPageDesktop {...viewProps} />
  ) : (
    <WorkspaceListPageMobile {...viewProps} />
  )

  return (
    <>
      {page}
      <ConfirmDialog
        actionError={
          deleteWorkspace.isError
            ? { error: deleteWorkspace.error, title: t(($) => $.workspaces.errors.couldNotDeleteWorkspace) }
            : null
        }
        confirmLabel={t(($) => $.workspaces.actions.deleteWorkspace)}
        confirming={deleteWorkspace.isPending}
        description={
          pendingDelete
            ? t(($) => $.workspaces.dialogs.deleteWorkspaceDescription, {
                title: pendingDelete.title,
              })
            : t(($) => $.workspaces.dialogs.deleteWorkspaceFallbackDescription)
        }
        open={pendingDelete !== null}
        title={
          pendingDelete
            ? t(($) => $.workspaces.dialogs.deleteWorkspaceTitle, {
                title: pendingDelete.title,
              })
            : t(($) => $.workspaces.dialogs.deleteWorkspaceFallbackTitle)
        }
        onConfirm={() => {
          if (pendingDelete) {
            deleteWorkspace.mutate(pendingDelete.id, {
              onSuccess: () => {
                setPendingDelete(null)
              },
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteWorkspaceDialog()
          }
        }}
      />
      <BottomActionErrorStatus
        className={isDesktop ? desktopBottomStatusStackClassName : undefined}
        error={setActiveWorkspace.isError ? setActiveWorkspace.error : null}
        title={t(($) => $.workspaces.errors.couldNotOpenWorkspace)}
      />
    </>
  )
}

type WorkspaceListPageViewProps =
  | {
      homeTarget: NavigationTarget
      showSkeleton: boolean
      state: 'loading'
    }
  | {
      error: unknown
      homeTarget: NavigationTarget
      state: 'workspaces-error'
      onRetry: () => void
    }
  | {
      content: ReactNode
      emptyState: ReactNode | null
      hasBottomStatus: boolean
      homeTarget: NavigationTarget
      mobileContent: ReactNode
      showCreateAction: boolean
      state: 'loaded'
      onCreateWorkspace: () => void
    }

const WorkspaceListPageDesktop = (props: WorkspaceListPageViewProps) => {
  const { t } = useTranslation()

  if (props.state === 'loading') {
    return (
      <DesktopPageLayout
        activeItem="spaces"
        homeTarget={props.homeTarget}
      >
        {props.showSkeleton ? <WorkspaceListLoadingState variant="desktop" /> : null}
      </DesktopPageLayout>
    )
  }

  if (props.state === 'workspaces-error') {
    return (
      <DesktopPageLayout
        activeItem="spaces"
        homeTarget={props.homeTarget}
      >
        <DesktopPageHeader title={t(($) => $.workspaces.labels.workspaces)} />
        <LoadErrorState
          error={props.error}
          title={t(($) => $.workspaces.errors.workspacesCouldNotLoad)}
          onRetry={props.onRetry}
        />
      </DesktopPageLayout>
    )
  }

  return (
    <DesktopPageLayout
      activeItem="spaces"
      homeTarget={props.homeTarget}
    >
      <DesktopPageHeader
        rightSlot={
          props.showCreateAction ? (
            <Button
              className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              type="button"
              variant="default"
              onClick={props.onCreateWorkspace}
            >
              <Plus className="size-4" />
              {t(($) => $.workspaces.actions.newWorkspace)}
            </Button>
          ) : undefined
        }
        title={t(($) => $.workspaces.labels.workspaces)}
      />
      {props.emptyState ? (
        <div className="max-w-section">{props.emptyState}</div>
      ) : (
        <div className={workspaceListDesktopGridClassName}>{props.content}</div>
      )}
    </DesktopPageLayout>
  )
}

const WorkspaceListPageMobile = (props: WorkspaceListPageViewProps) => {
  const { t } = useTranslation()

  if (props.state === 'loading') {
    return (
      <AppShell>
        {props.showSkeleton ? <WorkspaceListLoadingState /> : null}
        <BottomNav activeItem="spaces" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  if (props.state === 'workspaces-error') {
    return (
      <AppShell>
        <ScreenCanvas>
          <PageHeader title={t(($) => $.workspaces.labels.workspaces)} />
          <LoadErrorState
            error={props.error}
            title={t(($) => $.workspaces.errors.workspacesCouldNotLoad)}
            onRetry={props.onRetry}
          />
        </ScreenCanvas>
        <BottomNav activeItem="spaces" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas
        className={props.hasBottomStatus ? bottomStatusContentPaddingClassName : undefined}
      >
        <PageHeader
          rightSlot={
            props.showCreateAction ? (
              <WorkspaceCreateAction onCreateWorkspace={props.onCreateWorkspace} />
            ) : undefined
          }
          title={t(($) => $.workspaces.labels.workspaces)}
        />

        {props.emptyState ? (
          props.emptyState
        ) : (
          <div className="space-y-3">
            {props.mobileContent}
          </div>
        )}
      </ScreenCanvas>
      <BottomNav activeItem="spaces" homeTarget={props.homeTarget} />
    </AppShell>
  )
}

const WorkspaceCreateAction = ({
  onCreateWorkspace,
}: {
  onCreateWorkspace: () => void
}) => (
  <WorkspaceCreateActionContent onCreateWorkspace={onCreateWorkspace} />
)

const WorkspaceCreateActionContent = ({
  onCreateWorkspace,
}: {
  onCreateWorkspace: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Button
      aria-label={t(($) => $.workspaces.actions.newWorkspace)}
      className={`${responsiveActionButtonClassName} bg-primary text-primary-foreground hover:bg-primary/90`}
      type="button"
      variant="default"
      onClick={onCreateWorkspace}
    >
      <Plus className="size-4" />
    </Button>
  )
}
