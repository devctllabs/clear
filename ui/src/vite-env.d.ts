/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLEAR_API_BASE_URL?: string
  readonly VITE_SERVICE_MODE?: 'auto' | 'web' | 'tauri'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __TAURI_INTERNALS__?: {
    invoke?: (cmd: string, args?: unknown, options?: unknown) => Promise<unknown>
  }
}
