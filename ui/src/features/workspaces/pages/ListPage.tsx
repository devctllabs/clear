import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'

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
          label: 'Create workspace',
          onClick: openCreateWorkspace,
        },
      ]}
      description="Separate decks, notes, and review queues by study context."
      icon={<Plus className="size-6" />}
      title="Start with a workspace"
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
            ? { error: deleteWorkspace.error, title: 'Could not delete workspace' }
            : null
        }
        confirmLabel="Delete workspace"
        confirming={deleteWorkspace.isPending}
        description={
          pendingDelete
            ? `This moves "${pendingDelete.title}" to Trash. You can restore it later.`
            : 'This moves this workspace to Trash. You can restore it later.'
        }
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.title}"?` : 'Delete workspace?'}
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
        title="Could not open workspace"
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
        <DesktopPageHeader title="Workspaces" />
        <LoadErrorState
          error={props.error}
          title="Workspaces could not be loaded"
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
              New workspace
            </Button>
          ) : undefined
        }
        title="Workspaces"
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
          <PageHeader title="Workspaces" />
          <LoadErrorState
            error={props.error}
            title="Workspaces could not be loaded"
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
          title="Workspaces"
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
  <Button
    aria-label="New workspace"
    className={`${responsiveActionButtonClassName} bg-primary text-primary-foreground hover:bg-primary/90`}
    type="button"
    variant="default"
    onClick={onCreateWorkspace}
  >
    <Plus className="size-4" />
  </Button>
)
