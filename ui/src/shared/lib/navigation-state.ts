import { useLocation } from '@tanstack/react-router'
import type { NavigateOptions } from '@tanstack/react-router'

type NavigationStateUpdater = Exclude<NavigateOptions['state'], true | undefined>

const isInternalPath = (value: string) =>
  value.startsWith('/') && !value.startsWith('//') && !value.includes('://')

const reviewReturnTargetKey = (workspaceId: string, deckId: string) =>
  `clear:review-return-target:${workspaceId}:${deckId}`

export const createOpenedFromState =
  (openedFrom: string) =>
  ((previous: object) => ({
    ...previous,
    openedFrom: isInternalPath(openedFrom) ? openedFrom : undefined,
  })) as NavigationStateUpdater

export const resolveCloseTarget = (openedFrom: unknown, fallback: string) =>
  typeof openedFrom === 'string' && isInternalPath(openedFrom) ? openedFrom : fallback

export const saveReviewReturnTarget = (
  workspaceId: string,
  deckId: string,
  target: string,
) => {
  if (typeof window === 'undefined') {
    return
  }

  const key = reviewReturnTargetKey(workspaceId, deckId)

  if (!isInternalPath(target)) {
    window.sessionStorage.removeItem(key)
    return
  }

  window.sessionStorage.setItem(key, target)
}

export const readReviewReturnTarget = (
  workspaceId: string,
  deckId: string,
): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const key = reviewReturnTargetKey(workspaceId, deckId)
  const raw = window.sessionStorage.getItem(key)

  if (!raw) {
    return undefined
  }

  return isInternalPath(raw) ? raw : undefined
}

export const consumeReviewReturnTarget = (
  workspaceId: string,
  deckId: string,
): string | undefined => {
  const target = readReviewReturnTarget(workspaceId, deckId)

  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(reviewReturnTargetKey(workspaceId, deckId))
  }

  return target
}

export const useCloseTarget = (fallback: string) => {
  const openedFrom = useLocation({
    select: (location) => (location.state as { openedFrom?: unknown }).openedFrom,
  })

  return resolveCloseTarget(openedFrom, fallback)
}
