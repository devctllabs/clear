import {
  themePreferenceOptions,
  type ThemePreference,
} from '@core/theme'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

export const SettingsThemeSegmentedControl = ({
  onThemeChange,
  theme,
}: {
  onThemeChange: (theme: ThemePreference) => void
  theme: ThemePreference
}) => {
  return (
    <div
      aria-label="Theme"
      className="inline-flex items-center rounded-full bg-muted p-1"
      role="group"
    >
      {themePreferenceOptions.map((option) => {
        const isActive = option.id === theme

        return (
          <Button
            aria-pressed={isActive}
            className={cn(
              'type-label cursor-pointer rounded-full px-3.5 py-2 uppercase',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:hover:bg-muted',
            )}
            focusSurface="muted"
            key={option.id}
            type="button"
            onClick={() => {
              onThemeChange(option.id)
            }}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
