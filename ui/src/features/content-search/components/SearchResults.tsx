import type { ReactNode } from 'react'
import { Braces, ChevronRight, FileText, Folder } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { LazyIconGlyph } from '@shared/components/icons/IconGlyph'
import { Card } from '@shared/components/ui/card'
import { Button } from '@shared/components/ui/button'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { SectionHeading } from '@shared/components/layout/Screen'
import { useDateFormatters } from '@shared/lib/translated-date-format'
import { formatLocationPathLabel } from '@shared/lib/location-path'

import type { SearchResult, SearchResultGroup } from '../types/search.types'

export const SearchResults = ({
  emptyDescription,
  emptyTitle,
  error,
  groups,
  loading = false,
  onClearSearch,
  onRetry,
  query,
}: {
  emptyDescription: string
  emptyTitle: string
  error?: unknown
  groups?: SearchResultGroup[]
  loading?: boolean
  onClearSearch?: () => void
  onRetry?: () => void
  query: string
}) => {
  const { t } = useTranslation()
  const searchResultGroupLabels: Record<SearchResultGroup['kind'], string> = {
    deck: t(($) => $.search.resultGroups.deck),
    folder: t(($) => $.search.resultGroups.folder),
    note: t(($) => $.search.resultGroups.note),
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      <section className="w-full min-w-0 space-y-2">
        <SectionHeading>{t(($) => $.search.labels.results)}</SectionHeading>
        <p className="text-wrap-anywhere text-sm font-medium text-muted-foreground">
          {t(($) => $.search.labels.resultsFor, { query: query.trim() })}
        </p>
      </section>

      {loading ? (
        <SearchResultsLoadingState />
      ) : error ? (
        <LoadErrorState
          error={error}
          title={t(($) => $.search.errors.couldNotComplete)}
          onRetry={onRetry}
        />
      ) : groups === undefined ? null : groups.length > 0 ? (
        groups.map((group) => (
          <section className="w-full min-w-0 max-w-full space-y-4" key={group.kind}>
            <SectionHeading>{searchResultGroupLabels[group.kind]}</SectionHeading>
            <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
              {group.results.map((result, index) => (
                <div key={`${result.kind}-${result.id}`}>
                  <SearchResultRow result={result} />
                  {index < group.results.length - 1 ? (
                    <div className="mx-6 border-t border-border/60" />
                  ) : null}
                </div>
              ))}
            </Card>
          </section>
        ))
      ) : (
        <SearchResultsEmptyState title={emptyTitle} onClearSearch={onClearSearch}>
          {emptyDescription}
        </SearchResultsEmptyState>
      )}
    </div>
  )
}

const SearchResultsEmptyState = ({
  children,
  onClearSearch,
  title,
}: {
  children?: ReactNode
  onClearSearch?: () => void
  title: string
}) => (
  <div className="rounded-card border border-border bg-card p-8 text-center shadow-card">
    <p className="text-wrap-anywhere type-study-title text-foreground">
      {title}
    </p>
    {children ? (
      <div className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    ) : null}
    {onClearSearch ? (
      <Button
        className="type-action mt-5 h-auto rounded-full px-5 py-3"
        type="button"
        variant="outline"
        onClick={onClearSearch}
      >
        <SearchResultsClearSearchLabel />
      </Button>
    ) : null}
  </div>
)

const SearchResultsClearSearchLabel = () => {
  const { t } = useTranslation()

  return t(($) => $.search.actions.clearSearch)
}

const SearchResultsLoadingState = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.search.labels.searchingContent)}
      aria-live="polite"
      className="w-full min-w-0 max-w-full space-y-4"
      role="status"
    >
      <div aria-hidden="true" className="w-full min-w-0 max-w-full space-y-4">
        <SkeletonBlock className="h-3 w-20" />
        <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
          <SearchResultRowSkeleton />
          <div className="mx-6 border-t border-border/60" />
          <SearchResultRowSkeleton />
        </Card>
      </div>
    </section>
  )
}

const SearchResultRowSkeleton = () => (
  <div className="flex w-full min-w-0 items-center gap-4 px-6 py-5">
    <SkeletonBlock className="size-9 shrink-0" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex min-w-0 items-start gap-2">
        <SkeletonBlock className="h-4 min-w-0 flex-1" />
        <SkeletonBlock className="h-3 w-10 shrink-0" />
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <SkeletonBlock className="h-3 min-w-0 flex-1" />
        <SkeletonBlock className="h-3 w-16 shrink-0" />
      </div>
    </div>
    <SkeletonBlock className="size-4 shrink-0" />
  </div>
)

const SearchResultRow = ({ result }: { result: SearchResult }) => {
  const { t } = useTranslation()
  const { formatRelativeDate } = useDateFormatters()
  const target = getSearchResultTarget(result)
  const resultKindLabels: Record<SearchResult['kind'], string> = {
    deck: t(($) => $.search.resultKinds.deck),
    folder: t(($) => $.search.resultKinds.folder),
    note: t(($) => $.search.resultKinds.note),
  }

  return (
    <Link
      className="flex w-full min-w-0 items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-accent"
      params={target.params as never}
      to={target.to}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
        <SearchResultIcon result={result} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <span className="line-clamp-2 min-w-0 flex-1 text-wrap-anywhere type-row-title text-foreground">
            {result.title}
          </span>
          <span className="type-label shrink-0 uppercase text-muted-foreground">
            {resultKindLabels[result.kind]}
          </span>
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-muted-foreground">
          <span className="line-clamp-2 min-w-0 max-w-full flex-[1_1_12rem] text-wrap-anywhere">
            {formatLocationPathLabel(result.locationPath)}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-wrap-anywhere min-w-0 text-muted-foreground">
            {formatRelativeDate(result.updatedAt)}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/45" />
    </Link>
  )
}

const getSearchResultTarget = (result: SearchResult) => {
  if (result.kind === 'folder') {
    return {
      params: { folderId: result.id, workspaceId: result.workspaceId },
      to: '/dashboard/$workspaceId/folders/$folderId',
    } as const
  }

  if (result.kind === 'deck') {
    return {
      params: { deckId: result.id, workspaceId: result.workspaceId },
      to: '/dashboard/$workspaceId/decks/$deckId',
    } as const
  }

  return {
    params: { deckId: result.deckId, noteId: result.id, workspaceId: result.workspaceId },
    to: '/dashboard/$workspaceId/decks/$deckId/notes/$noteId',
  } as const
}

const SearchResultIcon = ({ result }: { result: SearchResult }) => {
  if (result.kind === 'folder') {
    return <Folder className="size-5 fill-current stroke-[2.1]" />
  }

  if (result.kind === 'deck') {
    return <LazyIconGlyph name={result.deckIcon ?? 'brain'} />
  }

  return result.noteKind === 'cloze' ? (
    <Braces className="size-4" />
  ) : (
    <FileText className="size-4" />
  )
}
