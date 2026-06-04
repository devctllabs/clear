import type { ComponentPropsWithoutRef } from 'react'

import { Pencil, Trash2 } from 'lucide-react'

import { LazyIconGlyph } from '@shared/components/icons/IconGlyph'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { Badge } from '@shared/components/ui/badge'
import { Button } from '@shared/components/ui/button'
import { Card } from '@shared/components/ui/card'
import { focusRingClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'
import { formatRelativeDate } from '@shared/lib/date-format'

import type { Workspace } from '../types/workspace.types'

const workspaceMenuTriggerClass = 'text-foreground hover:bg-muted'
const workspaceActionControlFrameClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full'
const activeWorkspaceBadgeClassName =
  'shrink-0 border border-border bg-card text-muted-foreground hover:bg-card'

export type WorkspaceCardDensity = 'compact' | 'regular'

export const WorkspaceSpaceCard = ({
  active = false,
  density = 'regular',
  opening = false,
  onDelete,
  onEdit,
  onOpen,
  workspace,
}: {
  active?: boolean
  density?: WorkspaceCardDensity
  opening?: boolean
  onDelete: (workspace: Workspace) => void
  onEdit: (workspaceId: string) => void
  onOpen: (workspaceId: string) => void
  workspace: Workspace
}) => {
  const openWorkspace = () => {
    if (opening) {
      return
    }

    onOpen(workspace.id)
  }

  const actionControl = (
    <span
      className={cn(
        workspaceActionControlFrameClassName,
        opening
          ? 'bg-muted text-muted-foreground'
          : 'pointer-events-auto',
      )}
      data-slot="workspace-card-action-frame"
    >
      {opening ? (
        <PendingSpinner label={`Opening ${workspace.title}`} />
      ) : (
        <ActionMenu
          dialogLabel={`${workspace.title} actions`}
          items={[
            {
              icon: <Pencil className="size-4 stroke-[2.4]" />,
              label: 'Edit',
              onSelect: () => {
                onEdit(workspace.id)
              },
            },
            {
              icon: <Trash2 className="size-4 stroke-[2.2]" />,
              label: 'Delete',
              onSelect: () => {
                onDelete(workspace)
              },
              tone: 'danger',
            },
          ]}
          triggerAriaLabel={`${workspace.title} actions`}
          triggerClassName={workspaceMenuTriggerClass}
          triggerFocusSurface="card"
        />
      )}
    </span>
  )

  if (density === 'compact') {
    return (
      <Card
        className={
          active
            ? 'relative isolate cursor-pointer overflow-hidden rounded-compact border border-foreground/20 bg-card shadow-none'
            : 'relative isolate cursor-pointer overflow-hidden rounded-compact border border-border bg-card shadow-card'
        }
      >
        <Button
          aria-label={`Open ${workspace.title}`}
          aria-busy={opening || undefined}
          className={cn(
            focusRingClassName,
            'absolute inset-0 z-10 cursor-pointer rounded-compact text-left focus-visible:ring-inset focus-visible:ring-offset-0',
          )}
          type="button"
          onClick={openWorkspace}
        />
        <div
          className="pointer-events-none relative z-20 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4"
          data-slot="workspace-card-content"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground">
            <LazyIconGlyph name={workspace.icon} />
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 text-foreground">
              {workspace.title}
            </h2>
            <p className="line-clamp-2 text-wrap-anywhere mt-1 text-sm leading-5 text-muted-foreground">
              {workspace.description}
            </p>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-wrap-anywhere type-label uppercase text-muted-foreground">
                {formatRelativeDate(workspace.updatedAt)}
              </p>
              {active ? (
                <WorkspaceBadge
                  className={activeWorkspaceBadgeClassName}
                  variant="outline"
                >
                  Active
                </WorkspaceBadge>
              ) : null}
            </div>
          </div>
          {actionControl}
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={
        active
          ? 'relative isolate flex h-full cursor-pointer flex-col overflow-hidden rounded-panel border border-foreground/20 bg-card shadow-none sm:rounded-card'
          : 'relative isolate flex h-full cursor-pointer flex-col overflow-hidden rounded-panel border border-border bg-card shadow-card sm:rounded-card'
      }
    >
      <Button
        aria-label={`Open ${workspace.title}`}
        aria-busy={opening || undefined}
        className={cn(
          focusRingClassName,
          'absolute inset-0 z-10 cursor-pointer rounded-panel text-left focus-visible:ring-inset focus-visible:ring-offset-0 sm:rounded-card',
        )}
        type="button"
        onClick={openWorkspace}
      />
      <div className="pointer-events-none relative z-20 flex h-full flex-1 flex-col p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-10">
          {active ? (
            <WorkspaceBadge
              className={activeWorkspaceBadgeClassName}
              variant="outline"
            >
              Active
            </WorkspaceBadge>
          ) : (
            <span aria-hidden="true" />
          )}
          {actionControl}
        </div>

        <div
          className="flex items-start gap-3.5 sm:gap-5"
          data-slot="workspace-card-content"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-foreground sm:size-14">
            <LazyIconGlyph name={workspace.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-wrap-anywhere type-study-title max-w-[14ch] text-[1.25rem] text-foreground sm:max-w-[12ch] sm:text-[1.5rem]">
              {workspace.title}
            </h2>
          </div>
        </div>

        <p className="line-clamp-3 text-wrap-anywhere mt-5 max-w-[34rem] text-sm leading-6 text-muted-foreground sm:line-clamp-5 sm:mt-8 sm:text-[0.97rem] sm:leading-7">
          {workspace.description}
        </p>

        <p className="text-wrap-anywhere type-label mt-auto pt-8 uppercase text-muted-foreground sm:pt-12">
          {formatRelativeDate(workspace.updatedAt)}
        </p>
      </div>
    </Card>
  )
}

const WorkspaceBadge = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Badge>) => (
  <Badge
    className={cn(
      'type-label px-3 py-1 uppercase',
      className,
    )}
    {...props}
  />
)
