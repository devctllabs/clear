import { useNavigate } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { useServices } from '@core/services'
import { ClearWordmark } from '@shared/components/layout/ClearWordmark'
import { Button } from '@shared/components/ui/button'
import { getUserMessage, type DomainError } from '@shared/errors'
import { useSetRuntimeProfile } from '@shared/hooks/useAppLayoutMode'
import { isAbortError } from '@shared/lib/abort'

const bootMainClassName =
  'flex min-h-screen overflow-x-hidden items-center justify-center bg-background px-6 text-foreground'

const bootContentClassName =
  'flex h-[16rem] w-full max-w-[24rem] flex-col items-center text-center'

const bootStateClassName =
  'mt-8 flex w-full flex-col items-center text-center'

export const BootPage = () => {
  const navigate = useNavigate()
  const services = useServices()
  const setRuntimeProfile = useSetRuntimeProfile()
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState<DomainError | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    setError(null)

    services.bootstrap
      .bootstrap({ signal: controller.signal })
      .then((result) => {
        if (!result.ok) {
          setError(result.error)
          return
        }

        setRuntimeProfile(result.value.runtimeProfile)
        void navigate({ replace: true, to: '/workspaces' })
      })
      .catch((caught) => {
        if (!isAbortError(caught)) {
          setError({
            message: 'Try again. If this keeps happening, reopen Clear.',
            retryable: false,
            type: 'unexpected',
          })
        }
      })

    return () => {
      controller.abort()
    }
  }, [attempt, navigate, services.bootstrap, setRuntimeProfile])

  if (error) {
    return (
      <BootShell>
        <BootErrorState
          error={error}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </BootShell>
    )
  }

  return (
    <BootShell>
      <section
        aria-busy="true"
        aria-live="polite"
        className={bootStateClassName}
        role="status"
      >
        <h1 className="type-study-title text-foreground">
          Preparing your study space
        </h1>
        <div
          aria-hidden="true"
          className="loading-shimmer mt-8 h-1.5 w-32 rounded-full"
        />
      </section>
    </BootShell>
  )
}

const BootShell = ({ children }: { children: ReactNode }) => (
  <main
    id="main-content"
    className={bootMainClassName}
  >
    <div className={bootContentClassName}>
      <ClearWordmark className="justify-center" />
      {children}
    </div>
  </main>
)

const BootErrorState = ({
  error,
  onRetry,
}: {
  error: DomainError
  onRetry: () => void
}) => (
  <section
    aria-live="assertive"
    className={bootStateClassName}
    role="alert"
  >
    <h1 className="text-wrap-anywhere type-study-title text-foreground">
      Could not start
    </h1>
    <p className="text-wrap-anywhere mt-3 max-w-[30ch] text-sm font-medium leading-6 text-muted-foreground">
      {getUserMessage(error)}
    </p>
    <Button
      className="type-action mt-8 h-auto rounded-full bg-primary px-7 py-4 text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
      type="button"
      variant="default"
      onClick={onRetry}
    >
      <RefreshCw aria-hidden="true" className="size-4" />
      Try again
    </Button>
  </section>
)
