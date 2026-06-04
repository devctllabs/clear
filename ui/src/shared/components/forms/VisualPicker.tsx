import {
  useCallback,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from 'react'
import { Ellipsis } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover'
import {
  LazyIconGlyph,
  type VisualIconName,
  type VisualOption,
} from '@shared/components/icons/IconGlyph'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Button } from '@shared/components/ui/button'
import { IconButton, type IconControlSize } from '@shared/components/ui/icon-button'
import { cn } from '@shared/lib/utils'

import { SearchBox } from './SearchBox'
import {
  useVisualPickerCatalog,
  useVisualPickerInfiniteScroll,
  type VisualPickerCatalogStatus,
} from './useVisualPickerCatalog'

const visualPickerLoadingCellCount = 12
const visualPickerLoadingCellIndexes = Array.from(
  { length: visualPickerLoadingCellCount },
  (_, index) => index,
)

const visualPickerTriggerButtonClassName =
  'border border-border bg-muted text-muted-foreground focus-visible:bg-muted focus-visible:hover:bg-muted'
const visualPickerSelectedOptionClassName =
  'border-transparent bg-primary text-primary-foreground focus-visible:bg-primary focus-visible:hover:bg-primary'
const visualPickerIdleOptionClassName =
  'border-border bg-muted text-muted-foreground focus-visible:bg-muted focus-visible:hover:bg-muted'
const desktopCatalogContentClassName =
  'flex h-[min(34rem,calc(100dvh-3rem))] w-[min(18rem,calc(100vw-3rem))] flex-col rounded-panel border border-border bg-popover p-3 shadow-floating'
const desktopCatalogHeaderClassName = 'shrink-0 space-y-3 border-b border-border pb-3'
const desktopCatalogResultClassName = '-mx-1 min-h-0 flex-1 overflow-y-auto quiet-scrollbar px-1 pb-1 pt-3'
const mobileDialogContentClassName =
  'flex h-[min(34rem,calc(100dvh-2rem))] max-w-mobile flex-col p-5'
const mobileCatalogResultClassName = '-mx-1 mt-4 min-h-0 flex-1 overflow-y-auto quiet-scrollbar px-1 py-1'
const visualPickerGridClassName =
  'grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] justify-items-center gap-2'

type VisualPickerProps = {
  allOptions?: readonly VisualOption[]
  description?: string
  label?: string
  loadOptions?: () => Promise<readonly VisualOption[]>
  onValueChange: (value: VisualIconName) => void
  presetOptions: readonly VisualOption[]
  value: VisualIconName
}

type VisualPickerCatalogSurface = 'card' | 'popover'

const loadFullVisualOptions = async (): Promise<readonly VisualOption[]> => {
  const { fullVisualOptions } = await import('@shared/components/icons/visualIconCatalog')

  return fullVisualOptions
}

const getVisualPickerOptionButtonClassName = (selected: boolean) =>
  cn(
    'border',
    selected ? visualPickerSelectedOptionClassName : visualPickerIdleOptionClassName,
  )

export const VisualPicker = ({
  allOptions,
  description,
  label,
  loadOptions = loadFullVisualOptions,
  onValueChange,
  presetOptions,
  value,
}: VisualPickerProps) => {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t(($) => $.common.labels.visual)
  const isDesktop = useIsDesktopLayout()
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null)
  const [loadMoreElement, setLoadMoreElement] = useState<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const catalog = useVisualPickerCatalog({
    allOptions,
    loadOptions,
    open: moreOpen,
    presetOptions,
    value,
  })
  const selectCatalogOption = useCallback((nextValue: VisualIconName) => {
    onValueChange(nextValue)
    setMoreOpen(false)
  }, [onValueChange])
  const catalogContentProps = {
    catalogStatus: catalog.catalogStatus,
    filteredOptions: catalog.filteredOptions,
    hasMoreOptions: catalog.hasMoreOptions,
    label: resolvedLabel,
    query: catalog.query,
    searchRef,
    selectedValue: value,
    setLoadMoreElement,
    setQuery: catalog.setQuery,
    setScrollContainerElement,
    visibleOptions: catalog.visibleOptions,
    onRetryCatalog: catalog.loadCatalogOptions,
    onSelect: selectCatalogOption,
  } satisfies VisualPickerCatalogContentProps

  useVisualPickerInfiniteScroll({
    enabled: catalog.hasMoreOptions,
    loadMoreElement,
    onLoadMore: catalog.loadMoreOptions,
    open: moreOpen,
    scrollContainerElement,
  })

  if (!catalog.selectedOption) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <SectionHeading>{resolvedLabel}</SectionHeading>
        {description ? (
          <p className="text-sm font-medium leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-card bg-card p-3">
        <div
          aria-label={t(($) => $.common.visualPicker.selectedIcon, {
            label: catalog.selectedOption.label,
          })}
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          role="img"
        >
          <span className="flex size-7 items-center justify-center">
            <LazyIconGlyph name={catalog.selectedOption.value} />
          </span>
        </div>

        <div className="-mx-1 -my-1 flex min-w-0 flex-1 items-center gap-3 overflow-x-auto px-1 py-1">
          {presetOptions.map((option) => (
            <VisualPickerOptionButton
              focusSurface="card"
              key={option.value}
              option={option}
              selected={option.value === value}
              size="xl"
              onSelect={onValueChange}
            />
          ))}
        </div>

        {isDesktop ? (
          <VisualPickerDesktopPopover
            catalogProps={catalogContentProps}
            label={resolvedLabel}
            open={moreOpen}
            searchRef={searchRef}
            onOpenChange={setMoreOpen}
          />
        ) : (
          <VisualPickerMobileDialog
            catalogProps={catalogContentProps}
            label={resolvedLabel}
            open={moreOpen}
            onOpenChange={setMoreOpen}
          />
        )}
      </div>
    </div>
  )
}

type VisualPickerOptionButtonProps = {
  focusSurface: VisualPickerCatalogSurface
  iconClassName?: string
  option: VisualOption
  selected: boolean
  size: IconControlSize
  title?: string
  onSelect: (value: VisualIconName) => void
}

const VisualPickerOptionButton = ({
  focusSurface,
  iconClassName,
  option,
  selected,
  size,
  title,
  onSelect,
}: VisualPickerOptionButtonProps) => (
  <IconButton
    aria-pressed={selected}
    className={getVisualPickerOptionButtonClassName(selected)}
    focusSurface={focusSurface}
    icon={(
      <span className={cn('flex size-6 items-center justify-center', iconClassName)}>
        <LazyIconGlyph name={option.value} />
      </span>
    )}
    label={option.label}
    size={size}
    title={title}
    type="button"
    onClick={() => onSelect(option.value)}
  />
)

type VisualPickerCatalogContentProps = {
  catalogStatus: VisualPickerCatalogStatus
  filteredOptions: readonly VisualOption[]
  hasMoreOptions: boolean
  label: string
  query: string
  searchRef: RefObject<HTMLInputElement | null>
  selectedValue: VisualIconName
  setLoadMoreElement: (element: HTMLDivElement | null) => void
  setQuery: (query: string) => void
  setScrollContainerElement: (element: HTMLDivElement | null) => void
  visibleOptions: readonly VisualOption[]
  onRetryCatalog: () => void
  onSelect: (value: VisualIconName) => void
}

type VisualPickerDesktopPopoverProps = {
  catalogProps: VisualPickerCatalogContentProps
  label: string
  open: boolean
  searchRef: RefObject<HTMLInputElement | null>
  onOpenChange: (open: boolean) => void
}

const VisualPickerDesktopPopover = ({
  catalogProps,
  label,
  open,
  searchRef,
  onOpenChange,
}: VisualPickerDesktopPopoverProps) => {
  const { t } = useTranslation()

  return (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <IconButton
        className={visualPickerTriggerButtonClassName}
        focusSurface="card"
        icon={<Ellipsis className="size-5" />}
        label={t(($) => $.common.visualPicker.moreIcons)}
        size="xl"
        title={t(($) => $.common.visualPicker.moreIcons)}
        type="button"
      />
    </PopoverTrigger>
    <PopoverContent
      align="end"
      aria-label={t(($) => $.common.visualPicker.iconPicker, { label })}
      className={desktopCatalogContentClassName}
      collisionPadding={24}
      role="dialog"
      sideOffset={10}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        queueMicrotask(() => searchRef.current?.focus())
      }}
    >
      <VisualPickerCatalog
        {...catalogProps}
        header={(
          <div className="px-1">
            <p className="type-label uppercase text-muted-foreground">
              {t(($) => $.common.visualPicker.allLucideIcons)}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {t(($) => $.common.visualPicker.browseIconsFor, {
                label: label.toLowerCase(),
              })}
            </p>
          </div>
        )}
        headerClassName={desktopCatalogHeaderClassName}
        resultClassName={desktopCatalogResultClassName}
        surface="popover"
      />
    </PopoverContent>
  </Popover>
  )
}

type VisualPickerMobileDialogProps = {
  catalogProps: VisualPickerCatalogContentProps
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VisualPickerMobileDialog = ({
  catalogProps,
  label,
  open,
  onOpenChange,
}: VisualPickerMobileDialogProps) => {
  const { t } = useTranslation()
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <IconButton
        ref={buttonRef}
        className={visualPickerTriggerButtonClassName}
        focusSurface="card"
        icon={<Ellipsis className="size-5" />}
        label={t(($) => $.common.visualPicker.moreIcons)}
        size="xl"
        title={t(($) => $.common.visualPicker.moreIcons)}
        type="button"
        onClick={() => onOpenChange(true)}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={mobileDialogContentClassName}
          onCloseAutoFocus={(event) => {
            if (!buttonRef.current) {
              return
            }

            event.preventDefault()
            buttonRef.current.focus()
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <VisualPickerCatalog
            {...catalogProps}
            header={(
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="type-study-title text-foreground">
                    {t(($) => $.common.visualPicker.chooseIcon)}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(($) => $.common.visualPicker.browseIconsFor, {
                      label: label.toLowerCase(),
                    })}
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
            )}
            headerClassName="shrink-0"
            resultClassName={mobileCatalogResultClassName}
            searchContainerClassName="mt-5 shrink-0"
            searchInputClassName="h-11 py-0"
            surface="card"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

type VisualPickerCatalogProps = VisualPickerCatalogContentProps & {
  header: ReactNode
  headerClassName?: string
  resultClassName: string
  searchContainerClassName?: string
  searchInputClassName?: string
  surface: VisualPickerCatalogSurface
}

const VisualPickerCatalog = ({
  catalogStatus,
  filteredOptions,
  hasMoreOptions,
  header,
  headerClassName,
  label,
  query,
  resultClassName,
  searchContainerClassName,
  searchInputClassName,
  searchRef,
  selectedValue,
  setLoadMoreElement,
  setQuery,
  setScrollContainerElement,
  surface,
  visibleOptions,
  onRetryCatalog,
  onSelect,
}: VisualPickerCatalogProps) => {
  const { t } = useTranslation()

  return (
  <>
    <div className={headerClassName}>
      {header}
      <SearchBox
        ref={searchRef}
        aria-label={t(($) => $.common.visualPicker.iconSearch, { label })}
        containerClassName={searchContainerClassName}
        icon={false}
        inputClassName={searchInputClassName}
        name="icon-search"
        placeholder={t(($) => $.common.visualPicker.searchIconsPlaceholder)}
        surface={surface}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </div>
    <div
      ref={setScrollContainerElement}
      className={resultClassName}
      data-testid="visual-picker-scroll-area"
    >
      <VisualPickerCatalogResults
        catalogStatus={catalogStatus}
        filteredOptions={filteredOptions}
        hasMoreOptions={hasMoreOptions}
        query={query}
        selectedValue={selectedValue}
        setLoadMoreElement={setLoadMoreElement}
        surface={surface}
        visibleOptions={visibleOptions}
        onRetryCatalog={onRetryCatalog}
        onSelect={onSelect}
      />
    </div>
  </>
  )
}

type VisualPickerCatalogResultsProps = {
  catalogStatus: VisualPickerCatalogStatus
  filteredOptions: readonly VisualOption[]
  hasMoreOptions: boolean
  query: string
  selectedValue: VisualIconName
  setLoadMoreElement: (element: HTMLDivElement | null) => void
  surface: VisualPickerCatalogSurface
  visibleOptions: readonly VisualOption[]
  onRetryCatalog: () => void
  onSelect: (value: VisualIconName) => void
}

const VisualPickerCatalogResults = ({
  catalogStatus,
  filteredOptions,
  hasMoreOptions,
  query,
  selectedValue,
  setLoadMoreElement,
  surface,
  visibleOptions,
  onRetryCatalog,
  onSelect,
}: VisualPickerCatalogResultsProps) => {
  const { t } = useTranslation()

  if (catalogStatus === 'idle' || catalogStatus === 'loading') {
    return <VisualPickerCatalogLoadingState />
  }

  if (catalogStatus === 'error') {
    return <VisualPickerCatalogErrorState onRetry={onRetryCatalog} />
  }

  if (!filteredOptions.length) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-6 text-center text-sm font-medium text-muted-foreground">
        {t(($) => $.common.visualPicker.noIconsMatch, { query })}
      </div>
    )
  }

  return (
    <>
      <div className={visualPickerGridClassName}>
        {visibleOptions.map((option) => (
          <VisualPickerOptionButton
            focusSurface={surface}
            iconClassName="rounded-full"
            key={option.value}
            option={option}
            selected={option.value === selectedValue}
            size="2xl"
            title={option.label}
            onSelect={onSelect}
          />
        ))}
        {hasMoreOptions ? <VisualPickerLoadingCells /> : null}
      </div>
      {hasMoreOptions ? (
        <div
          ref={setLoadMoreElement}
          className="flex justify-center py-3"
          data-testid="visual-picker-load-sentinel"
        >
          <span className="sr-only">
            {t(($) => $.common.visualPicker.loadingMoreIcons)}
          </span>
        </div>
      ) : null}
    </>
  )
}

const VisualPickerCatalogLoadingState = () => {
  const { t } = useTranslation()

  return (
    <div
      aria-label={t(($) => $.common.visualPicker.loadingIcons)}
      className={visualPickerGridClassName}
      role="status"
    >
      <VisualPickerLoadingCells />
    </div>
  )
}

const VisualPickerCatalogErrorState = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-6 text-center">
      <p className="text-sm font-medium leading-6 text-muted-foreground">
        {t(($) => $.common.visualPicker.iconsCouldNotLoad)}
      </p>
      <Button
        className="type-action mt-4 h-10 rounded-full px-5"
        focusSurface="card"
        type="button"
        variant="outline"
        onClick={onRetry}
      >
        {t(($) => $.common.actions.tryAgain)}
      </Button>
    </div>
  )
}

const VisualPickerLoadingCells = () => (
  <>
    {visualPickerLoadingCellIndexes.map((index) => (
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground/70"
        data-testid="visual-picker-loading-cell"
        key={index}
      >
        <span className="loading-shimmer block size-5 rounded-full" />
      </div>
    ))}
  </>
)
