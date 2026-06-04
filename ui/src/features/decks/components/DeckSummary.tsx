import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { ProgressRing } from '@shared/components/data/ProgressRing'
import { studyPanelClassName } from '@shared/components/layout/surfaces'
import { Button } from '@shared/components/ui/button'
import { Card } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'
import { formatNonNegativeInteger } from '@shared/lib/number-format'

import type { DeckDetail } from '../types/deck.types'

export const DeckStatRail = ({
  className,
  deck,
}: {
  className?: string
  deck: Pick<DeckDetail, 'dueToday' | 'totalNotes'>
}) => {
  const { t } = useTranslation()

  return (
    <div className={cn('grid min-w-0 grid-cols-2 gap-4', className)}>
      <DeckRailStat
        label={t(($) => $.decks.labels.due)}
        value={formatNonNegativeInteger(deck.dueToday)}
      />
      <DeckRailStat
        label={t(($) => $.decks.labels.notes)}
        value={formatNonNegativeInteger(deck.totalNotes)}
      />
    </div>
  )
}

const DeckRailStat = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 flex-1">
    <span className="type-label uppercase text-muted-foreground">
      {label}
    </span>
    <span className="text-wrap-anywhere type-technical mt-1 block text-base font-bold leading-none text-foreground">
      {value}
    </span>
  </div>
)

export const DeckSummary = ({
  deck,
  studyNowTo,
}: {
  deck: DeckDetail
  studyNowTo: string
}) => {
  const { t } = useTranslation()

  return (
    <Card className={cn(studyPanelClassName, 'space-y-5')}>
      <div className="flex min-w-0 items-center gap-5">
        <ProgressRing
          radius={42}
          size={92}
          strokeWidth={5}
          value={deck.progress}
          valueClassName="type-technical text-base font-bold"
        />

        <div className="min-w-0 flex-1">
          <p className="type-label uppercase text-muted-foreground">
            {t(($) => $.decks.labels.mastery)}
          </p>
          <DeckStatRail className="mt-3" deck={deck} />
        </div>
      </div>

      <Button
        asChild
        className="type-action h-12 w-full rounded-full bg-primary text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-95"
        variant="default"
      >
        <Link to={studyNowTo as never}>{t(($) => $.decks.actions.studyNow)}</Link>
      </Button>
    </Card>
  )
}
