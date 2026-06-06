import { getRuntimeKind } from '@shared/lib/runtime-profile'

export type ServiceMode = 'auto' | 'mock' | 'tauri' | 'web'
export type ResolvedServiceMode = Exclude<ServiceMode, 'auto'>
export type ConfiguredServiceMode = Exclude<ServiceMode, 'mock'>

const configuredServiceModes = ['auto', 'tauri', 'web'] as const

const isValidConfiguredServiceMode = (value: string | undefined): value is ConfiguredServiceMode =>
  typeof value === 'string' && configuredServiceModes.includes(value as ConfiguredServiceMode)

export const getConfiguredServiceMode = (): ConfiguredServiceMode => {
  const value = import.meta.env.VITE_SERVICE_MODE?.trim().toLowerCase()

  return isValidConfiguredServiceMode(value) ? value : 'auto'
}

export const resolveServiceMode = (
  mode: ServiceMode = getConfiguredServiceMode(),
): ResolvedServiceMode => (mode === 'auto' ? getRuntimeKind() : mode)

export {
  getInitialRuntimeProfile,
  getRuntimeKind,
  isTauriRuntime,
  type AppLayoutMode,
  type BootstrapResult,
  type RuntimeFormFactor,
  type RuntimeKind,
  type RuntimeProfile,
} from '@shared/lib/runtime-profile'
