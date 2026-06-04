export type RuntimeKind = 'tauri' | 'web'
export type RuntimeFormFactor = 'desktop' | 'mobile'
export type AppLayoutMode = RuntimeFormFactor

export type RuntimeProfile = {
  formFactor: RuntimeFormFactor
  runtime: RuntimeKind
}

export type BootstrapResult = {
  runtimeProfile: RuntimeProfile
}

const desktopInteractionQuery = '(hover: hover) and (pointer: fine)'
const coarseTouchQuery = '(hover: none) and (pointer: coarse)'
const desktopScreenMinShortSide = 700
const desktopScreenMinLongSide = 900

export const isTauriRuntime = () =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export const getRuntimeKind = (): RuntimeKind => (isTauriRuntime() ? 'tauri' : 'web')

export const getInitialRuntimeProfile = (): RuntimeProfile => ({
  formFactor: detectRuntimeFormFactor(),
  runtime: getRuntimeKind(),
})

export const createBootstrapResult = (
  runtimeProfile: RuntimeProfile = getInitialRuntimeProfile(),
): BootstrapResult => ({
  runtimeProfile,
})

const detectRuntimeFormFactor = (): RuntimeFormFactor => {
  if (hasDesktopInteraction()) {
    return 'desktop'
  }

  if (hasMobileNavigatorSignal() || hasCoarseTouchOnly()) {
    return 'mobile'
  }

  return hasDesktopScreenSize() ? 'desktop' : 'mobile'
}

const hasDesktopInteraction = () => matchMediaSafely(desktopInteractionQuery)

const hasCoarseTouchOnly = () =>
  matchMediaSafely(coarseTouchQuery) && getMaxTouchPoints() > 0

const hasMobileNavigatorSignal = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgentData = (
    navigator as Navigator & {
      userAgentData?: { mobile?: boolean }
    }
  ).userAgentData

  if (typeof userAgentData?.mobile === 'boolean') {
    return userAgentData.mobile
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

const getMaxTouchPoints = () =>
  typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints

const hasDesktopScreenSize = () => {
  if (typeof window === 'undefined' || typeof window.screen === 'undefined') {
    return false
  }

  const shortSide = Math.min(window.screen.width, window.screen.height)
  const longSide = Math.max(window.screen.width, window.screen.height)

  return shortSide >= desktopScreenMinShortSide && longSide >= desktopScreenMinLongSide
}

const matchMediaSafely = (query: string) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(query).matches
}
