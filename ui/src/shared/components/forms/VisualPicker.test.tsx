import type { ReactElement } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { VisualIconName, VisualOption } from '@shared/components/icons/IconGlyph'
import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'
import type { RuntimeFormFactor } from '@shared/lib/runtime-profile'

import { VisualPicker } from './VisualPicker'

const brain = 'brain' as VisualIconName
const flask = 'flask-conical' as VisualIconName
const globe = 'globe' as VisualIconName

const presetOptions: VisualOption[] = [
  { label: 'Brain', value: brain },
  { label: 'Flask', value: flask },
]

const allOptions: VisualOption[] = [
  ...presetOptions,
  { label: 'Globe', value: globe },
]

const createVisualOptions = (count: number): VisualOption[] =>
  Array.from({ length: count }, (_, index) => ({
    label: `Icon ${index + 1}`,
    value: `icon-${index + 1}` as VisualIconName,
  }))

const createDeferredOptions = () => {
  let resolve!: (value: readonly VisualOption[]) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<readonly VisualOption[]>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, reject, resolve }
}

const renderVisualPicker = (
  element: ReactElement,
  formFactor: RuntimeFormFactor = 'desktop',
) =>
  render(
    <AppRuntimeProfileProvider initialProfile={{ formFactor, runtime: 'web' }}>
      {element}
    </AppRuntimeProfileProvider>,
  )

const waitForMicrotask = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

const installIntersectionObserverMock = () => {
  const windowWithIntersectionObserver = window as Window & {
    IntersectionObserver?: typeof IntersectionObserver
  }
  const originalIntersectionObserver = windowWithIntersectionObserver.IntersectionObserver
  const observers: IntersectionObserverMock[] = []

  class IntersectionObserverMock {
    private callback: IntersectionObserverCallback

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
      observers.push(this)
    }

    disconnect = vi.fn()
    observe = vi.fn()
    takeRecords = vi.fn(() => [])
    unobserve = vi.fn()

    trigger() {
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
  }

  windowWithIntersectionObserver.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver

  return {
    observers,
    restore: () => {
      if (originalIntersectionObserver) {
        windowWithIntersectionObserver.IntersectionObserver = originalIntersectionObserver
        return
      }

      Reflect.deleteProperty(windowWithIntersectionObserver, 'IntersectionObserver')
    },
  }
}

describe('VisualPicker', () => {
  it('renders selected and preset options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderVisualPicker(
      <VisualPicker
        allOptions={allOptions}
        description="Pick a cover"
        label="Deck Visual"
        presetOptions={presetOptions}
        value={brain}
        onValueChange={onValueChange}
      />,
    )

    expect(screen.getByText('Deck Visual')).toBeInTheDocument()
    expect(screen.getByText('Pick a cover')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Selected Brain' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Brain' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Brain' })).toHaveClass(
      'card-focus-ring',
    )
    expect(screen.getByRole('button', { name: 'Brain' })).toHaveClass(
      'text-primary-foreground',
    )
    expect(screen.getByRole('button', { name: 'Brain' }).parentElement).toHaveClass(
      '-mx-1',
      'px-1',
      'py-1',
    )
    expect(screen.getByRole('button', { name: 'Flask' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Flask' })).toHaveClass(
      'text-muted-foreground',
    )
    expect(screen.getByRole('button', { name: 'Flask' })).not.toHaveClass(
      'text-muted-foreground/70',
    )
    expect(screen.getByRole('button', { name: 'More icons' })).toHaveClass(
      'text-muted-foreground',
    )
    expect(screen.getByRole('button', { name: 'More icons' })).not.toHaveClass(
      'text-muted-foreground/70',
    )

    await user.click(screen.getByRole('button', { name: 'Flask' }))
    expect(onValueChange).toHaveBeenCalledWith(flask)
  })

  it('searches full icon options and handles empty results', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderVisualPicker(
      <VisualPicker
        allOptions={allOptions}
        presetOptions={presetOptions}
        value={brain}
        onValueChange={onValueChange}
      />,
    )

    const moreIconsButton = screen.getByRole('button', { name: 'More icons' })
    expect(moreIconsButton).toHaveClass('card-focus-ring')
    await user.click(moreIconsButton)
    const picker = await screen.findByRole('dialog', { name: 'Visual icon picker' })
    await waitFor(() =>
      expect(within(picker).getByLabelText('Visual icon search')).toHaveFocus(),
    )
    expect(picker).toHaveClass(
      'flex',
      'h-[min(34rem,calc(100dvh-3rem))]',
      'w-[min(18rem,calc(100vw-3rem))]',
      'flex-col',
    )
    expect(within(picker).getByLabelText('Visual icon search')).toHaveClass(
      'keyboard-popover-input-focus',
    )
    expect(within(picker).getByLabelText('Visual icon search')).not.toHaveClass(
      'focus-visible:ring-2',
    )
    const iconGrid = picker.querySelector('.grid')
    expect(iconGrid).toHaveClass(
      'grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))]',
    )
    expect(iconGrid?.parentElement).toHaveClass(
      '-mx-1',
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
      'quiet-scrollbar',
      'px-1',
      'pb-1',
    )
    fireEvent.change(within(picker).getByLabelText('Visual icon search'), {
      target: { value: 'globe' },
    })
    const globeButton = await within(picker).findByRole('button', { name: 'Globe' })
    expect(globeButton).toHaveClass('popover-focus-ring')
    await user.click(globeButton)

    expect(onValueChange).toHaveBeenCalledWith(globe)
    expect(screen.queryByRole('dialog', { name: 'Visual icon picker' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'More icons' }))
    const reopenedPicker = await screen.findByRole('dialog', { name: 'Visual icon picker' })
    fireEvent.change(within(reopenedPicker).getByLabelText('Visual icon search'), {
      target: { value: 'zzzz' },
    })
    const emptyState = await within(reopenedPicker).findByText('No icons match "zzzz".')
    expect(emptyState).toBeInTheDocument()
    expect(emptyState).toHaveClass('min-h-full', 'items-center', 'justify-center')
    expect(emptyState).not.toHaveClass('bg-muted', 'border-dashed')
  })

  it('loads default full icon options only after the extended picker opens', async () => {
    const user = userEvent.setup()
    const deferredOptions = createDeferredOptions()
    const loadOptions = vi.fn(() => deferredOptions.promise)

    renderVisualPicker(
      <VisualPicker
        loadOptions={loadOptions}
        presetOptions={presetOptions}
        value={brain}
        onValueChange={vi.fn()}
      />,
    )

    expect(loadOptions).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'More icons' }))
    const picker = await screen.findByRole('dialog', { name: 'Visual icon picker' })

    expect(loadOptions).toHaveBeenCalledTimes(1)
    expect(within(picker).getByRole('status', { name: 'Loading icons' })).toBeInTheDocument()

    await act(async () => {
      deferredOptions.resolve(allOptions)
      await deferredOptions.promise
    })

    expect(await within(picker).findByRole('button', { name: 'Globe' })).toBeInTheDocument()
  })

  it('shows a retry state when full icon options fail to load', async () => {
    const user = userEvent.setup()
    const failedOptions = createDeferredOptions()
    const resolvedOptions = createDeferredOptions()
    const loadOptions = vi.fn()
      .mockReturnValueOnce(failedOptions.promise)
      .mockReturnValueOnce(resolvedOptions.promise)

    renderVisualPicker(
      <VisualPicker
        loadOptions={loadOptions}
        presetOptions={presetOptions}
        value={brain}
        onValueChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'More icons' }))
    const picker = await screen.findByRole('dialog', { name: 'Visual icon picker' })

    await act(async () => {
      failedOptions.reject(new Error('Catalog unavailable'))
      await failedOptions.promise.catch(() => undefined)
    })

    expect(await within(picker).findByText('Icons could not be loaded.')).toBeInTheDocument()

    await user.click(within(picker).getByRole('button', { name: 'Try again' }))
    expect(loadOptions).toHaveBeenCalledTimes(2)
    expect(within(picker).getByRole('status', { name: 'Loading icons' })).toBeInTheDocument()

    await act(async () => {
      resolvedOptions.resolve(allOptions)
      await resolvedOptions.promise
    })

    expect(await within(picker).findByRole('button', { name: 'Globe' })).toBeInTheDocument()
  })

  it('opens full icon options in a dialog on mobile layout without autofocus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    renderVisualPicker(
      <VisualPicker
        allOptions={allOptions}
        presetOptions={presetOptions}
        value={brain}
        onValueChange={onValueChange}
      />,
      'mobile',
    )

    const moreIconsButton = screen.getByRole('button', { name: 'More icons' })
    await user.click(moreIconsButton)
    const dialog = await screen.findByRole('dialog', { name: 'Choose Icon' })
    const searchInput = within(dialog).getByLabelText('Visual icon search')

    await waitForMicrotask()

    expect(screen.queryByRole('dialog', { name: 'Visual icon picker' })).not.toBeInTheDocument()
    expect(dialog).toHaveClass(
      'flex',
      'h-[min(34rem,calc(100dvh-2rem))]',
      'max-w-mobile',
      'flex-col',
    )
    expect(searchInput).not.toHaveFocus()
    expect(searchInput).toHaveClass('keyboard-card-input-focus')

    const scrollArea = within(dialog).getByTestId('visual-picker-scroll-area')
    expect(scrollArea).toHaveClass(
      '-mx-1',
      'mt-4',
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
      'quiet-scrollbar',
      'px-1',
      'py-1',
    )

    fireEvent.change(searchInput, {
      target: { value: 'globe' },
    })
    const globeButton = await within(dialog).findByRole('button', { name: 'Globe' })
    expect(globeButton).toHaveClass('card-focus-ring')
    await user.click(globeButton)

    expect(onValueChange).toHaveBeenCalledWith(globe)
    expect(screen.queryByRole('dialog', { name: 'Choose Icon' })).not.toBeInTheDocument()
    await waitFor(() => expect(moreIconsButton).toHaveFocus())
  })

  it('renders full icon options in batches and loads more through the scroll sentinel', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const observerMock = installIntersectionObserverMock()
    const largeOptions = createVisualOptions(125)

    try {
      renderVisualPicker(
        <VisualPicker
          allOptions={largeOptions}
          presetOptions={largeOptions.slice(0, 2)}
          value={largeOptions[0].value}
          onValueChange={onValueChange}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'More icons' }))
      const picker = await screen.findByRole('dialog', { name: 'Visual icon picker' })

      expect(within(picker).getByRole('button', { name: 'Icon 60' })).toBeInTheDocument()
      expect(within(picker).queryByRole('button', { name: 'Icon 61' })).not.toBeInTheDocument()
      expect(within(picker).getAllByTestId('visual-picker-loading-cell')).toHaveLength(12)
      expect(within(picker).getByTestId('visual-picker-load-sentinel')).toBeInTheDocument()
      await waitFor(() => expect(observerMock.observers).toHaveLength(1))

      act(() => {
        observerMock.observers[0].trigger()
      })

      expect(await within(picker).findByRole('button', { name: 'Icon 61' })).toBeInTheDocument()
      expect(within(picker).getByRole('button', { name: 'Icon 120' })).toBeInTheDocument()
      expect(within(picker).queryByRole('button', { name: 'Icon 121' })).not.toBeInTheDocument()

      fireEvent.change(within(picker).getByLabelText('Visual icon search'), {
        target: { value: 'Icon' },
      })
      await waitFor(() =>
        expect(within(picker).queryByRole('button', { name: 'Icon 61' })).not.toBeInTheDocument(),
      )
    } finally {
      observerMock.restore()
    }
  })

  it('loads more full icon options in the mobile dialog through the scroll sentinel', async () => {
    const user = userEvent.setup()
    const observerMock = installIntersectionObserverMock()
    const largeOptions = createVisualOptions(125)

    try {
      renderVisualPicker(
        <VisualPicker
          allOptions={largeOptions}
          presetOptions={largeOptions.slice(0, 2)}
          value={largeOptions[0].value}
          onValueChange={vi.fn()}
        />,
        'mobile',
      )

      await user.click(screen.getByRole('button', { name: 'More icons' }))
      const dialog = await screen.findByRole('dialog', { name: 'Choose Icon' })

      expect(within(dialog).getByRole('button', { name: 'Icon 60' })).toBeInTheDocument()
      expect(within(dialog).queryByRole('button', { name: 'Icon 61' })).not.toBeInTheDocument()
      expect(within(dialog).getAllByTestId('visual-picker-loading-cell')).toHaveLength(12)
      expect(within(dialog).getByTestId('visual-picker-load-sentinel')).toBeInTheDocument()
      await waitFor(() => expect(observerMock.observers).toHaveLength(1))

      act(() => {
        observerMock.observers[0].trigger()
      })

      expect(await within(dialog).findByRole('button', { name: 'Icon 61' })).toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: 'Icon 120' })).toBeInTheDocument()
      expect(within(dialog).queryByRole('button', { name: 'Icon 121' })).not.toBeInTheDocument()
    } finally {
      observerMock.restore()
    }
  })

  it('renders nothing when no selected option can be resolved', () => {
    const { container } = renderVisualPicker(
      <VisualPicker
        allOptions={[]}
        presetOptions={[]}
        value={brain}
        onValueChange={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
