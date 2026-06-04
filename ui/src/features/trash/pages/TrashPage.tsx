import { useState, type ReactNode } from 'react'

import {
  BottomStatus,
  BottomStatusStack,
  desktopBottomStatusStackClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { formatRelativeAge } from '@shared/lib/date-format'
import { formatNonNegativeInteger } from '@shared/lib/number-format'
import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import { TrashLoadingState } from '../components/TrashLoadingState'
import { TrashHeaderAction } from '../components/TrashHeaderAction'
import { WorkspaceTrashEmptyState } from '../components/WorkspaceTrashEmptyState'
import { WorkspaceTrashList } from '../components/WorkspaceTrashList'
import { WorkspaceTrashSummary } from '../components/WorkspaceTrashSummary'
import {
  useDeleteTrashItem,
  useRestoreTrashItem,
  useTrash,
} from '../hooks/useTrash'
import type { TrashItem } from '../types/trash.types'

export const TrashPage = () => {
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const homeTarget = activeWorkspaceIdQuery.data
    ? { to: `/dashboard/${activeWorkspaceIdQuery.data}` }
    : { to: '/workspaces' }
  const isDesktop = useIsDesktopLayout()
  const trashQuery = useTrash()
  const restoreItem = useRestoreTrashItem()
  const deleteItem = useDeleteTrashItem()
  const [pendingDeleteItem, setPendingDeleteItem] = useState<TrashItem | null>(null)
  const [pendingRestoreItemId, setPendingRestoreItemId] = useState<string | null>(null)
  const showInitialLoading = useDelayedBoolean(trashQuery.isLoading, 180)
  const showRestorePending = useDelayedBoolean(restoreItem.isPending, 250)
  const openDeleteItemDialog = (item: TrashItem) => {
    deleteItem.reset()
    setPendingDeleteItem(item)
  }
  const closeDeleteItemDialog = () => {
    setPendingDeleteItem(null)
    deleteItem.reset()
  }

  if (showInitialLoading) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      >
        <TrashLoadingState />
      </TrashPageShell>
    )
  }

  if (trashQuery.isLoading) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      />
    )
  }

  if (trashQuery.isError && trashQuery.data === undefined) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      >
        <LoadErrorState
          error={trashQuery.error}
          title="Trash could not be loaded"
          onRetry={() => {
            void trashQuery.refetch()
          }}
        />
      </TrashPageShell>
    )
  }

  const trashState = trashQuery.data ?? {
    items: [],
    lastEmptiedAt: new Date().toISOString(),
  }
  const itemCount = trashState.items.length
  const summaryLabel = `${formatNonNegativeInteger(itemCount)} item${itemCount === 1 ? '' : 's'}`
  const summaryAge = `Last emptied ${formatRelativeAge(trashState.lastEmptiedAt)}`
  const hasTrashRefreshError = trashQuery.isError && trashQuery.data !== undefined
  const hasBottomStatus = hasTrashRefreshError || restoreItem.isError
  const screenBottomPadding = hasTrashRefreshError && restoreItem.isError
    ? 'pb-[calc(16rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'
    : hasBottomStatus
      ? 'pb-[calc(13rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'
      : undefined

  return (
    <>
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
        screenClassName={screenBottomPadding}
      >
        <WorkspaceTrashSummary ageLabel={summaryAge} countLabel={summaryLabel} />
        <div className="mt-6">
          {itemCount > 0 ? (
            <WorkspaceTrashList
              items={trashState.items}
              onDeleteRequest={(item) => {
                openDeleteItemDialog(item)
              }}
              onRestore={(itemId) => {
                if (restoreItem.isPending) {
                  return
                }

                setPendingRestoreItemId(itemId)
                restoreItem.mutate(itemId, {
                  onSettled: () => {
                    setPendingRestoreItemId(null)
                  },
                })
              }}
              restoringItemId={pendingRestoreItemId}
              showRestoringSpinner={showRestorePending}
            />
          ) : (
            <WorkspaceTrashEmptyState />
          )}
        </div>
      </TrashPageShell>
      <ConfirmDialog
        actionError={
          deleteItem.isError
            ? { error: deleteItem.error, title: 'Could not delete item' }
            : null
        }
        confirmLabel="Delete permanently"
        confirming={deleteItem.isPending}
        description={
          pendingDeleteItem
            ? `This permanently deletes "${pendingDeleteItem.title}". This can't be undone.`
            : `This permanently deletes this item. This can't be undone.`
        }
        open={pendingDeleteItem !== null}
        title={
          pendingDeleteItem ? `Delete "${pendingDeleteItem.title}"?` : 'Delete item?'
        }
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }

          deleteItem.mutate(pendingDeleteItem.id, {
            onSuccess: () => {
              setPendingDeleteItem(null)
            },
          })
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteItemDialog()
          }
        }}
      />
      {hasBottomStatus ? (
        <BottomStatusStack className={isDesktop ? desktopBottomStatusStackClassName : undefined}>
          {hasTrashRefreshError ? (
            <BottomStatus
              actionLabel="Check again"
              dismissKey={trashQuery.errorUpdateCount}
              error={trashQuery.error}
              title="Trash may be out of date"
              onAction={() => {
                void trashQuery.refetch()
              }}
            />
          ) : null}
          {restoreItem.isError ? (
            <BottomStatus
              dismissLabel="Dismiss error"
              error={restoreItem.error}
              title="Could not restore item"
            />
          ) : null}
        </BottomStatusStack>
      ) : null}
    </>
  )
}

const TrashPageShell = ({
  children,
  homeTarget,
  isDesktop,
  rightSlot,
  screenClassName,
}: {
  children?: ReactNode
  homeTarget: NavigationTarget
  isDesktop: boolean
  rightSlot?: ReactNode
  screenClassName?: string
}) => {
  if (isDesktop) {
    return (
      <DesktopPageLayout
        activeItem="trash"
        contentClassName="mx-auto w-full max-w-page-narrow"
        homeTarget={homeTarget}
      >
        <DesktopPageHeader rightSlot={rightSlot} title="Trash" />
        {children}
      </DesktopPageLayout>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas className={screenClassName}>
        <PageHeader
          backTo="/menu"
          className="mb-7"
          reserveDescriptionSpace={false}
          rightSlot={rightSlot}
          title="Trash"
        />
        {children}
      </ScreenCanvas>
      <BottomNav activeItem="menu" homeTarget={homeTarget} />
    </AppShell>
  )
}
