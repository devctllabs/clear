import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { themeStorageKey } from '@core/theme'
import { renderRoute } from '@/test/renderRoute'
import { mockMatchMedia } from '@/test/matchMedia'
import { domainError, err } from '@shared/errors'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('SettingsPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays the settings skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingSettings =
      createDeferred<Awaited<ReturnType<typeof baseServices.settings.read>>>()
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        read: () => pendingSettings.promise,
      },
    }

    renderRoute('/menu/settings', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading settings' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Language' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading settings' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading settings' })).toBeInTheDocument()
  })

  it('renders the settings skeleton inside the desktop layout', async () => {
    vi.useFakeTimers()
    mockMatchMedia(true)
    const baseServices = createAppServices('mock')
    const pendingSettings =
      createDeferred<Awaited<ReturnType<typeof baseServices.settings.read>>>()
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        read: () => pendingSettings.promise,
      },
    }

    renderRoute('/menu/settings', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })

    const status = screen.getByRole('status', { name: 'Loading settings' })
    expect(status).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Settings' }).closest('div.mx-auto')).toHaveClass(
      'max-w-page-narrow',
    )
    expect(screen.getByRole('link', { name: 'Settings', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
    expect(status.textContent).toContain('General')
    expect(status.textContent).toContain('Schedule')
  })

  it('renders settings without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const settingsResult = await baseServices.settings.read()
    const pendingSettings =
      createDeferred<Awaited<ReturnType<typeof baseServices.settings.read>>>()
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        read: () => pendingSettings.promise,
      },
    }

    renderRoute('/menu/settings', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading settings' })).not.toBeInTheDocument()

    await act(async () => {
      pendingSettings.resolve(settingsResult)
      await pendingSettings.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('button', { name: 'Timezone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading settings' })).not.toBeInTheDocument()
  })

  it('renders settings and persists changed controls across remounts', async () => {
    const user = userEvent.setup()
    const firstRender = renderRoute('/menu/settings')

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Timezone' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/menu')
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('FSRS Parameters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent('English')

    await user.click(await screen.findByRole('button', { name: 'Timezone' }))
    const timezoneDialog = await screen.findByRole('dialog', { name: 'Choose Timezone' })
    fireEvent.change(within(timezoneDialog).getByLabelText('Search timezones'), {
      target: { value: 'tokyo' },
    })
    await user.click(await within(timezoneDialog).findByRole('button', { name: /Tokyo/ }))
    expect(await screen.findByRole('button', { name: 'Timezone' })).toHaveTextContent('Tokyo')

    const dailyNewLimit = await screen.findByRole('spinbutton', {
      name: 'New cards per day',
    })
    fireEvent.change(dailyNewLimit, { target: { value: '42' } })
    expect(dailyNewLimit).toHaveValue(42)

    firstRender.unmount()
    renderRoute('/menu/settings')

    expect(await screen.findByRole('button', { name: 'Timezone' })).toHaveTextContent('Tokyo')
    expect(await screen.findByRole('spinbutton', { name: 'New cards per day' })).toHaveValue(
      42,
    )
  })

  it('switches the interface language when a language option is selected', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const write = vi.fn(baseServices.settings.write)
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        write,
      },
    }

    renderRoute('/menu/settings', { services })

    const languageButton = await screen.findByRole('button', { name: 'Language' })

    expect(languageButton).toHaveTextContent('English')
    expect(document.documentElement).toHaveAttribute('lang', 'en-US')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')

    await user.click(languageButton)
    await user.click(await screen.findByRole('menuitem', { name: 'Arabic' }))

    expect(await screen.findByRole('heading', { name: 'الإعدادات' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    await waitFor(() => {
      expect(write).toHaveBeenCalledWith(expect.objectContaining({ language: 'ar' }))
    })
  })

  it('renders in the desktop sidebar layout', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    renderRoute('/menu/settings')

    const heading = await screen.findByRole('heading', { name: 'Settings' })
    expect(heading).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Timezone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent('English')
    expect(heading.closest('div.mx-auto')).toHaveClass('max-w-page-narrow')
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Settings sections' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Study settings' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('complementary', { name: 'General settings' }),
    ).not.toBeInTheDocument()
    const resetSection = screen.getByLabelText('Settings reset')
    const resetButton = within(resetSection).getByRole('button', {
      name: 'Reset all settings',
    })
    await user.click(resetButton)
    const dialog = await screen.findByRole('dialog', { name: 'Reset all settings?' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent(
      'This restores language, timezone, study limits, and FSRS settings.',
    )
    expect(screen.getByRole('link', { name: 'Settings', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.queryByRole('link', { name: 'Conflicts', hidden: true }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Trash', hidden: true })).toHaveAttribute(
      'href',
      '/menu/trash',
    )
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
  })

  it('resets settings to defaults after confirmation', async () => {
    const user = userEvent.setup()
    renderRoute('/menu/settings')

    await user.click(await screen.findByRole('button', { name: 'Timezone' }))
    const timezoneDialog = await screen.findByRole('dialog', { name: 'Choose Timezone' })
    fireEvent.change(within(timezoneDialog).getByLabelText('Search timezones'), {
      target: { value: 'tokyo' },
    })
    await user.click(await within(timezoneDialog).findByRole('button', { name: /Tokyo/ }))
    expect(await screen.findByRole('button', { name: 'Timezone' })).toHaveTextContent('Tokyo')

    const dailyNewLimit = await screen.findByRole('spinbutton', {
      name: 'New cards per day',
    })
    fireEvent.change(dailyNewLimit, { target: { value: '42' } })
    expect(dailyNewLimit).toHaveValue(42)

    await user.click(await screen.findByRole('button', { name: 'Reset all settings' }))
    const dialog = await screen.findByRole('dialog', { name: 'Reset all settings?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reset settings' }))

    expect(await screen.findByRole('button', { name: 'Timezone' })).toHaveTextContent(
      'Automatic',
    )
    expect(await screen.findByRole('spinbutton', { name: 'New cards per day' })).toHaveValue(
      20,
    )
  })

  it('keeps a failed reset dialog open and shows the error inside it', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        reset: vi.fn(async () => err(domainError.unexpected('Reset failed.'))),
      },
    }

    renderRoute('/menu/settings', { services })

    await user.click(await screen.findByRole('button', { name: 'Reset all settings' }))
    const dialog = await screen.findByRole('dialog', { name: 'Reset all settings?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reset settings' }))

    const failedDialog = await screen.findByRole('dialog', { name: 'Reset all settings?' })
    const alert = await within(failedDialog).findByRole('alert')

    expect(alert).toHaveTextContent('Could not reset settings')
    expect(alert).toHaveTextContent('Reset failed.')
    expect(within(failedDialog).getByRole('button', { name: 'Reset settings' })).toBeEnabled()
  })

  it('shows and dismisses a failed autosave status above the bottom navigation', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        write: vi.fn(async () => err(domainError.unexpected('Settings write failed.'))),
      },
    }

    renderRoute('/menu/settings', { services })

    const dailyNewLimit = await screen.findByRole('spinbutton', {
      name: 'New cards per day',
    })
    fireEvent.change(dailyNewLimit, { target: { value: '43' } })

    expect(dailyNewLimit).toHaveValue(43)

    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Could not save settings')
    expect(status).toHaveTextContent('Settings write failed.')
    expect(status).toHaveClass('rounded-card')
    expect(status).toHaveClass('border-border')
    expect(status).toHaveClass('bg-card')
    expect(status).not.toHaveClass('bg-destructive/10')
    const fixedStack = status.closest('.fixed')
    expect(fixedStack).not.toBeNull()
    expect(fixedStack).toHaveClass(
      'bottom-[calc(7rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]',
    )
    expect(screen.getByRole('link', { name: 'Menu' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Dismiss error' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows a delayed header spinner while autosave is pending', async () => {
    const baseServices = createAppServices('mock')
    const pendingWrite =
      createDeferred<Awaited<ReturnType<typeof baseServices.settings.write>>>()
    const write = vi.fn(() => pendingWrite.promise)
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        write,
      },
    }

    renderRoute('/menu/settings', { services })

    const dailyNewLimit = await screen.findByRole('spinbutton', {
      name: 'New cards per day',
    })
    fireEvent.change(dailyNewLimit, { target: { value: '43' } })

    await waitFor(() => {
      expect(write).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByRole('status', { name: 'Saving settings' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: 'Saving settings' }),
    ).toBeInTheDocument()
  })

  it('updates timezone, local theme, and schedule controls', async () => {
    const user = userEvent.setup()
    renderRoute('/menu/settings')

    await user.click(await screen.findByRole('button', { name: 'Timezone' }))
    const timezoneDialog = await screen.findByRole('dialog', { name: 'Choose Timezone' })
    fireEvent.change(within(timezoneDialog).getByLabelText('Search timezones'), {
      target: { value: 'tokyo' },
    })
    await user.click(await within(timezoneDialog).findByRole('button', { name: /Tokyo/ }))
    expect(await screen.findByRole('button', { name: 'Timezone' })).toHaveTextContent('Tokyo')

    await user.click(await screen.findByRole('button', { name: 'Dark' }))
    expect(await screen.findByRole('button', { name: 'Dark' })).toHaveClass('bg-primary')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark')

    const masteryHorizon = await screen.findByRole('spinbutton', { name: 'Mastery horizon' })
    fireEvent.change(masteryHorizon, { target: { value: '120' } })
    expect(masteryHorizon).toHaveValue(120)
  })

  it('stores theme locally without writing settings', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const write = vi.fn(baseServices.settings.write)
    const services = {
      ...baseServices,
      settings: {
        ...baseServices.settings,
        write,
      },
    }

    renderRoute('/menu/settings', { services })

    await user.click(await screen.findByRole('button', { name: 'System' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(write).not.toHaveBeenCalled()

    await user.click(await screen.findByRole('button', { name: 'Dark' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark')
    expect(write).not.toHaveBeenCalled()
  })

  it('handles empty timezone search and closes the picker from the overlay', async () => {
    const user = userEvent.setup()
    renderRoute('/menu/settings')

    await user.click(await screen.findByRole('button', { name: 'Timezone' }))
    const timezoneDialog = await screen.findByRole('dialog', { name: 'Choose Timezone' })
    fireEvent.change(within(timezoneDialog).getByLabelText('Search timezones'), {
      target: { value: 'no-city-match' },
    })

    expect(await within(timezoneDialog).findByText('No matching timezones.')).toBeInTheDocument()

    const timezoneOverlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(timezoneOverlay).toBeInTheDocument()
    await user.click(timezoneOverlay as HTMLElement)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Choose Timezone' })).not.toBeInTheDocument()
    })
  })

  it('updates remaining study controls and closes modal actions', async () => {
    const user = userEvent.setup()
    renderRoute('/menu/settings')

    const dailyReviewLimit = await screen.findByRole('spinbutton', {
      name: 'Review cards per day',
    })
    fireEvent.change(dailyReviewLimit, { target: { value: '84' } })
    expect(dailyReviewLimit).toHaveValue(84)

    expect(await screen.findByRole('button', { name: 'New card order' })).toHaveTextContent(
      'Before reviews',
    )

    const targetRecall = await screen.findByRole('slider')
    targetRecall.focus()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => {
      expect(targetRecall).toHaveAttribute('aria-valuenow', '91')
    })

    await user.click(await screen.findByRole('button', { name: 'Timezone' }))
    const timezoneDialog = await screen.findByRole('dialog', { name: 'Choose Timezone' })
    await user.click(within(timezoneDialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Choose Timezone' })).not.toBeInTheDocument()
    })

    await user.click(await screen.findByRole('button', { name: 'FSRS Parameters' }))
    const fsrsDialog = await screen.findByRole('dialog', { name: 'Edit FSRS parameters' })
    await user.click(within(fsrsDialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit FSRS parameters' })).not.toBeInTheDocument()
    })

    await user.click(await screen.findByRole('button', { name: 'FSRS Parameters' }))
    const overlayDialog = await screen.findByRole('dialog', { name: 'Edit FSRS parameters' })
    expect(overlayDialog).toBeInTheDocument()
    const fsrsOverlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(fsrsOverlay).toBeInTheDocument()
    await user.click(fsrsOverlay as HTMLElement)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit FSRS parameters' })).not.toBeInTheDocument()
    })
  }, 10_000)

  it('validates and saves FSRS parameters', async () => {
    const user = userEvent.setup()
    renderRoute('/menu/settings')

    await user.click(await screen.findByRole('button', { name: 'FSRS Parameters' }))
    const fsrsDialog = await screen.findByRole('dialog', { name: 'Edit FSRS parameters' })
    const textarea = within(fsrsDialog).getByLabelText('FSRS Parameters JSON')

    fireEvent.change(textarea, { target: { value: 'not json' } })
    await user.click(within(fsrsDialog).getByRole('button', { name: 'Save' }))
    expect(
      await within(fsrsDialog).findByText('Paste valid JSON with 21 numeric values.'),
    ).toBeInTheDocument()

    fireEvent.change(textarea, { target: { value: '[1,2,3]' } })
    await user.click(within(fsrsDialog).getByRole('button', { name: 'Save' }))
    expect(
      await within(fsrsDialog).findByText(
        'Enter a JSON array with exactly 21 finite numbers.',
      ),
    ).toBeInTheDocument()

    const customParams = Array.from({ length: 21 }, (_, index) => Number((index + 0.5).toFixed(1)))
    fireEvent.change(textarea, { target: { value: JSON.stringify(customParams) } })
    await user.click(within(fsrsDialog).getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit FSRS parameters' })).not.toBeInTheDocument()
    })
    expect(await screen.findByRole('button', { name: 'FSRS Parameters' })).toHaveTextContent(
      'Custom',
    )

    await user.click(await screen.findByRole('button', { name: 'FSRS Parameters' }))
    const reopenedDialog = await screen.findByRole('dialog', { name: 'Edit FSRS parameters' })
    await user.click(within(reopenedDialog).getByRole('button', { name: 'Reset to defaults' }))
    await user.click(within(reopenedDialog).getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('button', { name: 'FSRS Parameters' })).toHaveTextContent(
      'Default',
    )

    await user.click(await screen.findByRole('button', { name: 'FSRS Parameters' }))
    const defaultDialog = await screen.findByRole('dialog', { name: 'Edit FSRS parameters' })
    await user.click(within(defaultDialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit FSRS parameters' })).not.toBeInTheDocument()
    })
  })
})
