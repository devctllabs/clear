import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppI18nProvider, createAppI18n, defaultLocale } from '@core/i18n'

describe('AppI18nProvider', () => {
  it('syncs document language and direction with the active i18n language', async () => {
    const i18n = createAppI18n('ar')

    render(
      <AppI18nProvider i18n={i18n}>
        <div />
      </AppI18nProvider>,
    )

    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')

    await act(async () => {
      await i18n.changeLanguage('he')
    })

    expect(document.documentElement).toHaveAttribute('lang', 'he')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')

    await act(async () => {
      await i18n.changeLanguage(defaultLocale)
    })

    expect(document.documentElement).toHaveAttribute('lang', defaultLocale)
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('uses default document metadata for unsupported locales', () => {
    const i18n = createAppI18n('zz')

    render(
      <AppI18nProvider i18n={i18n}>
        <div />
      </AppI18nProvider>,
    )

    expect(document.documentElement).toHaveAttribute('lang', defaultLocale)
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })
})
