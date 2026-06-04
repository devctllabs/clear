import { cn } from '@shared/lib/utils'
import { normalizePercentage } from '@shared/lib/number-format'

const normalizeProgressValue = (value: number) => {
  return normalizePercentage(value)
}

export const ProgressRing = ({
  label,
  labelClassName,
  radius,
  size = 44,
  strokeWidth = 2.5,
  value,
  valueClassName = 'type-technical text-[10px] font-bold',
}: {
  label?: string
  labelClassName?: string
  radius?: number
  size?: number
  strokeWidth?: number
  value: number
  valueClassName?: string
}) => {
  const normalizedValue = normalizeProgressValue(value)
  const resolvedRadius = radius ?? size / 2 - 4
  const circumference = 2 * Math.PI * resolvedRadius
  const dashOffset = circumference - (normalizedValue / 100) * circumference
  const center = size / 2

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ height: size, width: size }}
    >
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          cx={center}
          cy={center}
          fill="transparent"
          r={resolvedRadius}
          stroke="var(--progress-ring-track, currentColor)"
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(normalizedValue === 0 ? 'text-muted-foreground/35' : 'text-foreground')}
          cx={center}
          cy={center}
          fill="transparent"
          r={resolvedRadius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-bold text-foreground', valueClassName)}>{normalizedValue}%</span>
        {label ? (
          <span
            className={cn(
              'type-label uppercase text-muted-foreground',
              labelClassName,
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
