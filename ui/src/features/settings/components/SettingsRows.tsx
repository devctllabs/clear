import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/components/ui/button'
import { cardInputFocusRingClassName } from '@shared/components/ui/focus'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  dropdownMenuItemClassName,
} from '@shared/components/ui/dropdown-menu'
import { Slider } from '@shared/components/ui/slider'
import { cn } from '@shared/lib/utils'
import {
  normalizeNonNegativeInteger,
  normalizePercentage,
} from '@shared/lib/number-format'

const settingsNumberInputClassName =
  'type-label type-technical h-10 w-24 max-w-full rounded-full bg-input px-3 text-right text-foreground transition-colors placeholder:text-muted-foreground/70 focus:bg-input'
const settingsRowButtonClassName =
  'flex w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5 text-left transition-colors hover:bg-accent'
const settingsRowValueClusterClassName =
  'flex min-w-0 max-w-full shrink-0 items-center gap-2 self-center text-right'
const settingsRowValueClassName =
  'inline-flex min-h-10 min-w-0 max-w-full items-center justify-end rounded-full bg-muted px-3.5 py-2 text-right text-foreground'

const percentageMin = 0
const percentageMax = 100
const percentageStep = 1

const clampPercentage = (value: number) =>
  normalizePercentage(value)

const SettingsRowValue = ({ value }: { value: string }) => (
  <span className={settingsRowValueClassName}>
    <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0">
      {value}
    </span>
  </span>
)

export const SettingsRow = ({
  chevron = false,
  description,
  onClick,
  label,
  value,
}: {
  chevron?: boolean
  description: string
  onClick?: () => void
  label: string
  value: string
}) => (
  <Button
    aria-label={label}
    className={cn(settingsRowButtonClassName)}
    focusSurface="card"
    type="button"
    onClick={onClick}
  >
    <div className="min-w-0 flex-1">
      <p className="type-row-title text-foreground">
        {label}
      </p>
      <p className="text-wrap-anywhere mt-0.5 text-[13px] leading-5 text-muted-foreground">
        {description}
      </p>
    </div>

    <div className={settingsRowValueClusterClassName}>
      <SettingsRowValue value={value} />
      {chevron ? <ChevronRight className="size-4.5 text-muted-foreground/70" /> : null}
    </div>
  </Button>
)

export const SettingsDropdownRow = <T extends string>({
  description,
  label,
  onSelect,
  options,
  value,
}: {
  description: string
  label: string
  onSelect: (value: T) => void
  options: readonly { label: string; value: T }[]
  value: T
}) => (
  <SettingsDropdownRowContent
    description={description}
    label={label}
    options={options}
    value={value}
    onSelect={onSelect}
  />
)

const SettingsDropdownRowContent = <T extends string>({
  description,
  label,
  onSelect,
  options,
  value,
}: {
  description: string
  label: string
  onSelect: (value: T) => void
  options: readonly { label: string; value: T }[]
  value: T
}) => {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={label}
          className={cn(settingsRowButtonClassName)}
          focusSurface="card"
          type="button"
        >
          <div className="min-w-0 flex-1">
            <p className="type-row-title text-foreground">
              {label}
            </p>
            <p className="text-wrap-anywhere mt-0.5 text-[13px] leading-5 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className={settingsRowValueClusterClassName}>
            <SettingsRowValue
              value={options.find((option) => option.value === value)?.label ?? value}
            />
            <ChevronRight className="size-4.5 text-muted-foreground/70" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-w-[calc(100vw-2rem)] min-w-[15rem] rounded-compact border border-border bg-popover p-2 shadow-floating"
        sideOffset={8}
      >
        {options.map((option) => (
          <DropdownMenuItem
            className={dropdownMenuItemClassName({
              className: 'justify-between',
              tone: 'foreground',
            })}
            key={option.value}
            onSelect={() => {
              onSelect(option.value)
            }}
          >
            <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0">
              {option.label}
            </span>
            {option.value === value ? (
              <span className="type-label rounded-full bg-primary px-2.5 py-0.5 uppercase text-primary-foreground">
                {t(($) => $.common.labels.active)}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const SettingsNumberRow = ({
  description,
  label,
  onChange,
  value,
}: {
  description: string
  label: string
  onChange: (value: number) => void
  value: number
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5 transition-colors hover:bg-accent focus-within:bg-accent">
    <div className="min-w-0 flex-1">
      <p className="type-row-title text-foreground">
        {label}
      </p>
      <p className="text-wrap-anywhere mt-0.5 text-[13px] leading-5 text-muted-foreground">
        {description}
      </p>
    </div>

    <input
      aria-label={label}
      className={cn(
        settingsNumberInputClassName,
        cardInputFocusRingClassName,
      )}
      min={0}
      name={label.toLowerCase().replace(/\s+/g, '-')}
      step={1}
      type="number"
      value={normalizeNonNegativeInteger(value)}
      onChange={(event) => {
        const nextValue = normalizeNonNegativeInteger(Number(event.target.value))

        if (Number.isFinite(Number(event.target.value))) {
          onChange(nextValue)
        }
      }}
    />
  </div>
)

export const SettingsSliderRow = ({
  description,
  label,
  onChange,
  value,
}: {
  description: string
  label: string
  onChange: (value: number) => void
  value: number
}) => (
  <SettingsSliderRowContent
    description={description}
    label={label}
    value={value}
    onChange={onChange}
  />
)

const SettingsSliderRowContent = ({
  description,
  label,
  onChange,
  value,
}: {
  description: string
  label: string
  onChange: (value: number) => void
  value: number
}) => {
  const { t } = useTranslation()

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="type-row-title text-foreground">
            {label}
          </p>
          <p className="text-wrap-anywhere mt-0.5 text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="relative isolate shrink-0">
          <input
            aria-label={t(($) => $.common.labels.percentageInput, { label })}
            aria-valuetext={`${clampPercentage(value)}%`}
            className={cn(
              settingsNumberInputClassName,
              'pr-7 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              cardInputFocusRingClassName,
            )}
            max={percentageMax}
            min={percentageMin}
            name={`${label.toLowerCase().replace(/\s+/g, '-')}-percentage`}
            step={percentageStep}
            type="number"
            value={clampPercentage(value)}
            onChange={(event) => {
              const nextValue = Number(event.target.value)

              if (Number.isFinite(nextValue)) {
                onChange(clampPercentage(nextValue))
              }
            }}
          />
          <span
            aria-hidden="true"
            className="type-label type-technical pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-foreground"
          >
            %
          </span>
        </span>
      </div>
      <Slider
        className="mt-4"
        focusSurface="card"
        max={percentageMax}
        min={percentageMin}
        step={percentageStep}
        thumbProps={{ 'aria-label': label }}
        value={[clampPercentage(value)]}
        onValueChange={(nextValue) => {
          const next = nextValue[0]

          if (typeof next === 'number') {
            onChange(clampPercentage(next))
          }
        }}
      />
    </div>
  )
}
