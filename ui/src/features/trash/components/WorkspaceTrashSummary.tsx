import { DateText } from '@shared/components/data/DateText'

export const WorkspaceTrashSummary = ({
  ageLabel,
  ageTimestamp,
  countLabel,
}: {
  ageLabel: string
  ageTimestamp: string
  countLabel: string
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-full bg-muted px-6 py-5 ring-1 ring-border/60">
    <div className="flex min-w-0 items-center gap-4">
      <span className="size-3 shrink-0 rounded-full bg-primary" />
      <span className="text-wrap-anywhere type-row-title min-w-0 text-foreground">
        {countLabel}
      </span>
    </div>
    <span className="text-wrap-anywhere min-w-0 flex-1 text-right text-[15px] font-medium leading-5 text-muted-foreground">
      <DateText timestamp={ageTimestamp}>{ageLabel}</DateText>
    </span>
  </div>
)
