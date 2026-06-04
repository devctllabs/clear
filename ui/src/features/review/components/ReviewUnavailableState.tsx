import { Link } from '@tanstack/react-router'
import { FileText } from 'lucide-react'

import { Button } from '@shared/components/ui/button'

import { ReviewSessionHeader } from './ReviewSessionView'

export const ReviewUnavailableState = ({
  deckId,
  onClose,
  workspaceId,
}: {
  deckId: string
  onClose: () => void
  workspaceId: string
}) => (
  <main
    id="main-content"
    className="relative flex min-h-screen flex-col bg-background text-foreground"
  >
    <ReviewSessionHeader onClose={onClose} />
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 pb-32 pt-24">
      <div className="rounded-card border border-border bg-card p-8 text-center shadow-card">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-foreground">
          <FileText className="size-6" />
        </div>
        <p className="type-study-title mt-6 text-foreground">
          No cards to review
        </p>
        <p className="text-wrap-anywhere mt-3 text-sm font-medium leading-6 text-muted-foreground">
          Add a note so this deck can enter the review queue.
        </p>
        <Button
          asChild
          className="type-action mt-8 h-auto w-full rounded-full bg-primary py-5 text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
          variant="default"
        >
          <Link
            params={{ deckId, kind: 'basic', workspaceId }}
            to="/dashboard/$workspaceId/decks/$deckId/notes/new/$kind"
          >
            New note
          </Link>
        </Button>
        <Button
          asChild
          className="type-action mt-3 h-auto w-full rounded-full border border-border bg-card py-5 text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
          variant="outline"
        >
          <Link
            params={{ deckId, workspaceId }}
            to="/dashboard/$workspaceId/decks/$deckId"
          >
            Back to deck
          </Link>
        </Button>
      </div>
    </section>
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    />
  </main>
)
