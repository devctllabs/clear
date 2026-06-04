import { create } from 'zustand'

export type ThemePreference = 'dark' | 'light' | 'system'

type ResolvedTheme = 'dark' | 'light'

export const themeStorageKey = 'clear-ui:theme-preference:v1'

const defaultThemePreference: ThemePreference = 'system'

const systemThemeQuery = '(prefers-color-scheme: dark)'

export const themePreferenceOptions: Array<{
  id: ThemePreference
  label: string
}> = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

type ThemeStore = {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  syncSystemTheme: () => void
}

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'dark' || value === 'light' || value === 'system'

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light'
}

export const applyTheme = (theme: ResolvedTheme) => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
}

const resolvePreference = (preference: ThemePreference): ResolvedTheme => {
  return preference === 'system' ? getSystemTheme() : preference
}

const readStoredPreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return defaultThemePreference
  }

  try {
    const stored = window.localStorage.getItem(themeStorageKey)

    return isThemePreference(stored) ? stored : defaultThemePreference
  } catch {
    return defaultThemePreference
  }
}

const writeStoredPreference = (preference: ThemePreference) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(themeStorageKey, preference)
  } catch {
    // Theme still applies for the current session when storage is unavailable.
  }
}

const getInitialThemeState = () => {
  const preference = readStoredPreference()
  const resolvedTheme = resolvePreference(preference)

  return { preference, resolvedTheme }
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  ...getInitialThemeState(),
  setPreference: (preference) => {
    const resolvedTheme = resolvePreference(preference)

    writeStoredPreference(preference)
    applyTheme(resolvedTheme)
    set({ preference, resolvedTheme })
  },
  syncSystemTheme: () => {
    const resolvedTheme = resolvePreference(get().preference)

    applyTheme(resolvedTheme)
    set({ resolvedTheme })
  },
}))

export const initializeTheme = () => {
  const initialState = getInitialThemeState()

  applyTheme(initialState.resolvedTheme)
  useThemeStore.setState(initialState)

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }

  const mediaQuery = window.matchMedia(systemThemeQuery)
  const onSystemThemeChange = () => {
    useThemeStore.getState().syncSystemTheme()
  }

  mediaQuery.addEventListener('change', onSystemThemeChange)

  return () => {
    mediaQuery.removeEventListener('change', onSystemThemeChange)
  }
}

export const resetThemeStoreForTests = () => {
  const resolvedTheme = resolvePreference(defaultThemePreference)

  useThemeStore.setState({
    preference: defaultThemePreference,
    resolvedTheme,
  })
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(themeStorageKey)
  }
  applyTheme(resolvedTheme)
}
