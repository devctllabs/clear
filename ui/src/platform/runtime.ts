import { getRuntimeKind } from '@shared/lib/runtime-profile'

export type ServiceMode = 'auto' | 'mock' | 'tauri' | 'web'
export type ResolvedServiceMode = Exclude<ServiceMode, 'auto'>

const serviceModes = ['auto', 'mock', 'tauri', 'web'] as const

const isValidServiceMode = (value: string | undefined): value is ServiceMode =>
  typeof value === 'string' && serviceModes.includes(value as ServiceMode)

export const getConfiguredServiceMode = (): ServiceMode => {
  const value = import.meta.env.VITE_SERVICE_MODE?.trim().toLowerCase()

  return isValidServiceMode(value) ? value : 'auto'
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
