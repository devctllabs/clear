import { Trash2 } from 'lucide-react'

export const WorkspaceTrashEmptyState = () => (
  <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-start px-4 pt-8 text-center">
    <div className="flex size-28 items-center justify-center rounded-full bg-card shadow-card">
      <Trash2 className="size-12 stroke-[1.9] text-muted-foreground opacity-45" />
    </div>
    <h2 className="type-page-title mt-10 text-foreground">
      Trash is empty
    </h2>
    <p className="mt-4 max-w-sm text-[1.05rem] leading-7 text-muted-foreground">
      Items you delete will appear here before permanent removal.
    </p>
  </div>
)
