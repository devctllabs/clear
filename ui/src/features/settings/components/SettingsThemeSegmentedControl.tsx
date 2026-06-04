import {
  themePreferenceOptions,
  type ThemePreference,
} from '@core/theme'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'
import { useTranslation } from 'react-i18next'

export const SettingsThemeSegmentedControl = ({
  onThemeChange,
  theme,
}: {
  onThemeChange: (theme: ThemePreference) => void
  theme: ThemePreference
}) => {
  const { t } = useTranslation()

  const getThemeLabel = (themePreference: ThemePreference) => {
    switch (themePreference) {
      case 'dark':
        return t(($) => $.settings.options.themeDark)
      case 'light':
        return t(($) => $.settings.options.themeLight)
      case 'system':
        return t(($) => $.settings.options.themeSystem)
    }
  }

  return (
    <div
      aria-label={t(($) => $.settings.labels.theme)}
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
            {getThemeLabel(option.id)}
          </Button>
        )
      })}
    </div>
  )
}
