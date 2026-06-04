import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  createVisualOption,
  type VisualIconName,
  type VisualOption,
} from '@shared/components/icons/IconGlyph'

const visualPickerBatchSize = 60
const emptyVisualOptions: readonly VisualOption[] = []

export type VisualPickerCatalogStatus = 'idle' | 'loading' | 'loaded' | 'error'

type UseVisualPickerCatalogOptions = {
  allOptions?: readonly VisualOption[]
  loadOptions: () => Promise<readonly VisualOption[]>
  open: boolean
  presetOptions: readonly VisualOption[]
  value: VisualIconName
}

export const useVisualPickerCatalog = ({
  allOptions: providedCatalogOptions,
  loadOptions,
  open,
  presetOptions,
  value,
}: UseVisualPickerCatalogOptions) => {
  const [query, setQuery] = useState('')
  const [loadedCatalogOptions, setLoadedCatalogOptions] =
    useState<readonly VisualOption[] | null>(null)
  const [loadedCatalogStatus, setLoadedCatalogStatus] =
    useState<VisualPickerCatalogStatus>(providedCatalogOptions ? 'loaded' : 'idle')
  const [visibleOptionCount, setVisibleOptionCount] = useState(visualPickerBatchSize)
  const catalogOptions = providedCatalogOptions ?? loadedCatalogOptions ?? emptyVisualOptions
  const catalogStatus = providedCatalogOptions ? 'loaded' : loadedCatalogStatus
  const selectedOption =
    presetOptions.find((option) => option.value === value) ??
    catalogOptions.find((option) => option.value === value) ??
    (providedCatalogOptions === undefined ? createVisualOption(value) : undefined)
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return catalogOptions
    }

    return catalogOptions.filter((option) => {
      const haystack = `${option.label} ${option.value}`.toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [catalogOptions, query])
  const visibleOptions = useMemo(
    () => filteredOptions.slice(0, visibleOptionCount),
    [filteredOptions, visibleOptionCount],
  )
  const hasMoreOptions =
    catalogStatus === 'loaded' && visibleOptionCount < filteredOptions.length
  const resetCatalogView = useCallback(() => {
    setQuery('')
    setVisibleOptionCount(visualPickerBatchSize)
  }, [])
  const loadCatalogOptions = useCallback(async () => {
    if (
      providedCatalogOptions ||
      loadedCatalogStatus === 'loading' ||
      loadedCatalogStatus === 'loaded'
    ) {
      return
    }

    setLoadedCatalogStatus('loading')

    try {
      const options = await loadOptions()

      setLoadedCatalogOptions(options)
      setLoadedCatalogStatus('loaded')
    } catch {
      setLoadedCatalogStatus('error')
    }
  }, [
    loadedCatalogStatus,
    loadOptions,
    providedCatalogOptions,
  ])
  const loadMoreOptions = useCallback(() => {
    setVisibleOptionCount((count) =>
      Math.min(count + visualPickerBatchSize, filteredOptions.length),
    )
  }, [filteredOptions.length])

  useEffect(() => {
    if (open) {
      resetCatalogView()
    }
  }, [
    open,
    resetCatalogView,
  ])

  useEffect(() => {
    if (open && catalogStatus === 'idle') {
      void loadCatalogOptions()
    }
  }, [
    catalogStatus,
    loadCatalogOptions,
    open,
  ])

  useEffect(() => {
    setVisibleOptionCount(visualPickerBatchSize)
  }, [query])

  return {
    catalogStatus,
    filteredOptions,
    hasMoreOptions,
    loadCatalogOptions,
    loadMoreOptions,
    query,
    selectedOption,
    setQuery,
    visibleOptions,
  }
}

type UseVisualPickerInfiniteScrollOptions = {
  enabled: boolean
  loadMoreElement: HTMLDivElement | null
  onLoadMore: () => void
  open: boolean
  scrollContainerElement: HTMLDivElement | null
}

export const useVisualPickerInfiniteScroll = ({
  enabled,
  loadMoreElement,
  onLoadMore,
  open,
  scrollContainerElement,
}: UseVisualPickerInfiniteScrollOptions) => {
  useEffect(() => {
    if (!open || !enabled) {
      return
    }

    if (!scrollContainerElement || !loadMoreElement) {
      return
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      {
        root: scrollContainerElement,
        rootMargin: '96px 0px',
        threshold: 0,
      },
    )

    observer.observe(loadMoreElement)

    return () => {
      observer.disconnect()
    }
  }, [
    enabled,
    loadMoreElement,
    onLoadMore,
    open,
    scrollContainerElement,
  ])
}
