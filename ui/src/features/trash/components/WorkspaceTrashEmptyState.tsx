import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const WorkspaceTrashEmptyState = () => {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-start px-4 pt-8 text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-card shadow-card">
        <Trash2 className="size-12 stroke-[1.9] text-muted-foreground opacity-45" />
      </div>
      <h2 className="type-page-title mt-10 text-foreground">
        {t(($) => $.trash.empty.title)}
      </h2>
      <p className="mt-4 max-w-sm text-[1.05rem] leading-7 text-muted-foreground">
        {t(($) => $.trash.empty.description)}
      </p>
    </div>
  )
}
