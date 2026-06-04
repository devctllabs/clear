import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { SearchBox } from '@shared/components/forms/SearchBox'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import type { Settings } from '../types/settings.types'
import { settingsTimezoneOptions } from '../utils/timezone-options'

type SettingsTimezone = Settings['timezone']

export const SettingsTimezonePickerDialog = ({
  open,
  onOpenChange,
  onSelect,
  value,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (value: SettingsTimezone) => void
  value: SettingsTimezone
}) => {
  const { t } = useTranslation()
  const isDesktop = useIsDesktopLayout()
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const translatedOptions = settingsTimezoneOptions.map((option) =>
    option.value === 'auto'
      ? {
          ...option,
          description: t(($) => $.settings.options.timezoneSystem),
          label: t(($) => $.settings.labels.automatic),
        }
      : option,
  )

  const filteredOptions = translatedOptions.filter((option) => {
    const haystack = `${option.label} ${option.value} ${option.description}`.toLowerCase()

    return haystack.includes(query.trim().toLowerCase())
  })

  const rememberFocusedElement = () => {
    const activeElement = document.activeElement

    restoreFocusRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(34rem,calc(100dvh-2rem))] max-w-mobile flex-col p-5"
        onCloseAutoFocus={(event) => {
          if (!restoreFocusRef.current) {
            return
          }

          event.preventDefault()
          restoreFocusRef.current.focus()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          rememberFocusedElement()

          if (isDesktop) {
            searchInputRef.current?.focus()
          }
        }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <DialogTitle className="text-wrap-anywhere type-study-title text-foreground">
              {t(($) => $.settings.dialogs.timezoneTitle)}
            </DialogTitle>
            <DialogDescription
              className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground"
            >
              {t(($) => $.settings.dialogs.timezoneDescription)}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              className="h-10 rounded-full"
              focusSurface="card"
              type="button"
              variant="outline"
            >
              {t(($) => $.common.actions.close)}
            </Button>
          </DialogClose>
        </div>

        <SearchBox
          ref={searchInputRef}
          aria-label={t(($) => $.settings.dialogs.timezoneSearchLabel)}
          containerClassName="mt-5 shrink-0"
          icon={false}
          inputClassName="h-11 py-0"
          name="timezone-search"
          placeholder={t(($) => $.settings.dialogs.timezoneSearchPlaceholder)}
          surface="card"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
        />

        <div
          className="-mx-1 mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto quiet-scrollbar px-1 py-1"
          data-testid="timezone-picker-results"
        >
          {filteredOptions.map((option) => {
            const isActive = option.value === value

            return (
              <Button
                aria-current={isActive ? 'true' : undefined}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-compact bg-card px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:bg-card focus-visible:hover:bg-card"
                focusSurface="card"
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  onOpenChange(false)
                }}
              >
                <div className="min-w-0">
                  <p className="text-wrap-anywhere type-row-title text-foreground">
                    {option.label}
                  </p>
                  <p className="text-wrap-anywhere mt-0.5 text-[12px] leading-5 text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                {isActive ? (
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[12px] font-semibold leading-5 text-primary-foreground">
                    {t(($) => $.common.labels.active)}
                  </span>
                ) : null}
              </Button>
            )
          })}
          {filteredOptions.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
              {t(($) => $.settings.labels.searchNoTimezones)}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
