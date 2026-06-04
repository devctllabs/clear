const RELOAD_TRANSITION_KEY = 'clear:reload-transition'
const RELOAD_DELAY_MS = 60

export const markReloadTransition = () => {
  window.sessionStorage.setItem(RELOAD_TRANSITION_KEY, '1')
}

export const consumeReloadTransition = () => {
  const shouldAnimate = window.sessionStorage.getItem(RELOAD_TRANSITION_KEY) === '1'

  if (shouldAnimate) {
    window.sessionStorage.removeItem(RELOAD_TRANSITION_KEY)
  }

  return shouldAnimate
}

export const reloadPage = () => {
  markReloadTransition()
  window.setTimeout(() => {
    window.location.reload()
  }, RELOAD_DELAY_MS)
}
