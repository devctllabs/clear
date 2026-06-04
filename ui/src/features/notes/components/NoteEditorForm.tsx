import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  useRef,
} from 'react'
import { Bold, Braces, Italic, Link2, List } from 'lucide-react'

import { Button } from '@shared/components/ui/button'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import { IconButton } from '@shared/components/ui/icon-button'
import { SectionHeading } from '@shared/components/layout/Screen'
import { cn } from '@shared/lib/utils'

import type { BasicNoteEditor, ClozeNoteEditor, NoteKind } from '../types/note.types'
import {
  applyMarkdownFormat,
  type MarkdownFormatAction,
} from '../utils/markdown-formatting'

type MarkdownFieldId = 'back' | 'body' | 'front'

type MarkdownSelection = {
  selectionEnd: number
  selectionStart: number
}

type MarkdownUndoEntry = MarkdownSelection & {
  value: string
}

type MarkdownToolbarTarget = {
  id: MarkdownFieldId
  onChange: (value: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
}

export const NoteEditorForm = ({
  activeKind,
  basicDraft,
  clozeDraft,
  onBackChange,
  onBodyChange,
  onFrontChange,
  onKindChange,
  onTitleChange,
  title,
}: {
  activeKind: NoteKind
  basicDraft: BasicNoteEditor
  clozeDraft: ClozeNoteEditor
  onBackChange: (value: string) => void
  onBodyChange: (value: string) => void
  onFrontChange: (value: string) => void
  onKindChange: (kind: NoteKind) => void
  onTitleChange: (value: string) => void
  title: string
}) => (
  <>
    <ModeSwitcher activeKind={activeKind} onKindChange={onKindChange} />
    {activeKind === 'basic' ? (
      <BasicNoteForm
        draft={basicDraft}
        title={title}
        onBackChange={onBackChange}
        onFrontChange={onFrontChange}
        onTitleChange={onTitleChange}
      />
    ) : (
      <ClozeNoteForm
        draft={clozeDraft}
        title={title}
        onBodyChange={onBodyChange}
        onTitleChange={onTitleChange}
      />
    )}
  </>
)

const ModeSwitcher = ({
  activeKind,
  onKindChange,
}: {
  activeKind: NoteKind
  onKindChange: (kind: NoteKind) => void
}) => {
  return (
    <div className="mb-6 flex justify-center">
      <div
        aria-label="Note type"
        className="inline-flex max-w-full rounded-full bg-muted p-1 ring-1 ring-border"
        role="group"
      >
        {(['basic', 'cloze'] as const).map((kind) => (
          <Button
            aria-pressed={activeKind === kind}
            className={cn(
              'flex min-h-10 min-w-28 cursor-pointer items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold capitalize transition-colors',
              activeKind === kind
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            key={kind}
            type="button"
            onClick={() => {
              onKindChange(kind)
            }}
          >
            {kind}
          </Button>
        ))}
      </div>
    </div>
  )
}

const BasicNoteForm = ({
  draft,
  onBackChange,
  onFrontChange,
  onTitleChange,
  title,
}: {
  draft: BasicNoteEditor
  onBackChange: (value: string) => void
  onFrontChange: (value: string) => void
  onTitleChange: (value: string) => void
  title: string
}) => {
  const frontTextareaRef = useRef<HTMLTextAreaElement>(null)
  const backTextareaRef = useRef<HTMLTextAreaElement>(null)
  const activeFieldRef = useRef<Extract<MarkdownFieldId, 'back' | 'front'>>('back')
  const { clearUndoEntries, handleUndo, pushUndoEntry } = useMarkdownUndo()
  const frontTarget: MarkdownToolbarTarget = {
    id: 'front',
    onChange: onFrontChange,
    textareaRef: frontTextareaRef,
    value: draft.front,
  }
  const backTarget: MarkdownToolbarTarget = {
    id: 'back',
    onChange: onBackChange,
    textareaRef: backTextareaRef,
    value: draft.back,
  }
  const setActiveField = (fieldId: 'back' | 'front') => {
    activeFieldRef.current = fieldId
  }
  const getActiveTarget = () =>
    activeFieldRef.current === 'front' ? frontTarget : backTarget

  return (
    <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="px-8 pb-8 pt-8">
        <TextField
          id="basic-note-title"
          label="Title"
          name="note-title"
          placeholder="Add a note title"
          value={title}
          onChange={onTitleChange}
        />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 pt-8">
        <TextAreaField
          id="basic-note-front"
          label="Front"
          name="note-front"
          placeholder="Enter front side"
          textareaRef={frontTextareaRef}
          value={draft.front}
          onChange={(value) => {
            clearUndoEntries('front')
            onFrontChange(value)
          }}
          onFocus={() => setActiveField('front')}
          onKeyDown={(event) => handleUndo(event, frontTarget)}
          onSelect={() => setActiveField('front')}
        />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <TextAreaField
          id="basic-note-back"
          label="Back"
          name="note-back"
          placeholder="Enter back side"
          textareaRef={backTextareaRef}
          value={draft.back}
          onChange={(value) => {
            clearUndoEntries('back')
            onBackChange(value)
          }}
          onFocus={() => setActiveField('back')}
          onKeyDown={(event) => handleUndo(event, backTarget)}
          onSelect={() => setActiveField('back')}
        />
        <EditorToolbar
          getTarget={getActiveTarget}
          onSaveUndo={pushUndoEntry}
        />
      </div>
    </Card>
  )
}

const ClozeNoteForm = ({
  draft,
  onBodyChange,
  onTitleChange,
  title,
}: {
  draft: ClozeNoteEditor
  onBodyChange: (value: string) => void
  onTitleChange: (value: string) => void
  title: string
}) => {
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { clearUndoEntries, handleUndo, pushUndoEntry } = useMarkdownUndo()
  const bodyTarget: MarkdownToolbarTarget = {
    id: 'body',
    onChange: onBodyChange,
    textareaRef: bodyTextareaRef,
    value: draft.body,
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="px-8 pb-8 pt-8">
          <TextField
            id="cloze-note-title"
            label="Title"
            name="note-title"
            placeholder="Add a note title"
            value={title}
            onChange={onTitleChange}
          />
        </div>
        <hr className="mx-8 border-t border-border" />
        <div className="px-8 py-8">
          <TextAreaField
            id="cloze-note-body"
            label="Note body"
            minRows={9}
            name="note-body"
            placeholder="Write the note body with cloze deletions…"
            textareaRef={bodyTextareaRef}
            value={draft.body}
            onChange={(value) => {
              clearUndoEntries('body')
              onBodyChange(value)
            }}
            onKeyDown={(event) => handleUndo(event, bodyTarget)}
          />
          <EditorToolbar
            getTarget={() => bodyTarget}
            showAddCloze
            onSaveUndo={pushUndoEntry}
          />
        </div>
      </Card>
      <Card className="overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <Braces className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="type-row-title text-foreground">
              Cloze format
            </h2>
            <p className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
              Wrap hidden text with <span className="font-bold text-foreground">{'{{c1::...}}'}</span>.
              {' '}Each hidden part becomes a review card when you save.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

const TextField = ({
  id,
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) => (
  <>
    <SectionHeading>{label}</SectionHeading>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <input
      autoComplete="off"
      className={cn(
        'type-study-title mt-4 block w-full border-0 bg-transparent px-1 py-0 text-foreground placeholder:text-muted-foreground/45',
        editorFieldFocusClassName,
      )}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </>
)

const TextAreaField = ({
  id,
  label,
  minRows = 5,
  name,
  onChange,
  onFocus,
  onKeyDown,
  onSelect,
  placeholder,
  textareaRef,
  value,
}: {
  id: string
  label: string
  minRows?: number
  name: string
  onChange: (value: string) => void
  onFocus?: () => void
  onKeyDown?: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void
  onSelect?: () => void
  placeholder: string
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  value: string
}) => (
  <>
    <SectionHeading>{label}</SectionHeading>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <textarea
      autoComplete="off"
      className={cn(
        'type-editor-body mt-4 block w-full resize-none border-0 bg-transparent px-1 py-0 text-foreground placeholder:text-muted-foreground/45',
        editorFieldFocusClassName,
        minRows >= 9 ? 'min-h-48' : 'min-h-36',
      )}
      id={id}
      name={name}
      placeholder={placeholder}
      ref={textareaRef}
      rows={minRows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
    />
  </>
)

const EditorToolbar = ({
  getTarget,
  onSaveUndo,
  showAddCloze = false,
}: {
  getTarget: () => MarkdownToolbarTarget
  onSaveUndo: (target: MarkdownToolbarTarget, selection: MarkdownSelection) => void
  showAddCloze?: boolean
}) => {
  const applyFormat = (action: MarkdownFormatAction) => {
    const target = getTarget()
    const selection = getTextareaSelection(target)
    const result = applyMarkdownFormat({
      action,
      selectionEnd: selection.selectionEnd,
      selectionStart: selection.selectionStart,
      value: target.value,
    })

    onSaveUndo(target, selection)
    target.onChange(result.value)

    window.setTimeout(() => {
      const nextTextarea = target.textareaRef.current

      if (!nextTextarea) {
        return
      }

      nextTextarea.focus()
      nextTextarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    }, 0)
  }

  return (
    <div
      aria-label="Markdown formatting"
      className="quiet-scrollbar mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-1"
      role="toolbar"
    >
      <ToolbarButton
        icon={<Bold className="size-4" />}
        label="Bold"
        onClick={() => applyFormat('bold')}
      />
      <ToolbarButton
        icon={<Italic className="size-4" />}
        label="Italic"
        onClick={() => applyFormat('italic')}
      />
      <ToolbarButton
        icon={<Link2 className="size-4" />}
        label="Link"
        onClick={() => applyFormat('link')}
      />
      <ToolbarButton
        icon={<List className="size-4" />}
        label="List"
        onClick={() => applyFormat('list')}
      />
      {showAddCloze ? (
        <ToolbarButton
          icon={<Braces className="size-4" />}
          label="Add cloze"
          onClick={() => applyFormat('cloze')}
        />
      ) : null}
    </div>
  )
}

const ToolbarButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <IconButton
      className="border border-border bg-card text-muted-foreground"
      focusSurface="card"
      icon={icon}
      label={label}
      size="lg"
      title={label}
      type="button"
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
    />
  )
}

const useMarkdownUndo = () => {
  const undoEntriesRef = useRef<Partial<Record<MarkdownFieldId, MarkdownUndoEntry[]>>>({})

  const clearUndoEntries = (fieldId: MarkdownFieldId) => {
    undoEntriesRef.current[fieldId] = []
  }

  const pushUndoEntry = (target: MarkdownToolbarTarget, selection: MarkdownSelection) => {
    const entries = undoEntriesRef.current[target.id] ?? []

    undoEntriesRef.current[target.id] = [
      ...entries,
      {
        ...selection,
        value: target.value,
      },
    ]
  }

  const handleUndo = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
    target: MarkdownToolbarTarget,
  ) => {
    if (!isUndoShortcut(event)) {
      return
    }

    const entries = undoEntriesRef.current[target.id] ?? []
    const lastEntry = entries.at(-1)

    if (!lastEntry) {
      return
    }

    event.preventDefault()
    undoEntriesRef.current[target.id] = entries.slice(0, -1)
    target.onChange(lastEntry.value)

    window.setTimeout(() => {
      const textarea = target.textareaRef.current

      if (!textarea) {
        return
      }

      textarea.focus()
      textarea.setSelectionRange(lastEntry.selectionStart, lastEntry.selectionEnd)
    }, 0)
  }

  return {
    clearUndoEntries,
    handleUndo,
    pushUndoEntry,
  }
}

const getTextareaSelection = (target: MarkdownToolbarTarget): MarkdownSelection => {
  const textarea = target.textareaRef.current
  const fallbackPosition = target.value.length

  return {
    selectionEnd: textarea?.selectionEnd ?? fallbackPosition,
    selectionStart: textarea?.selectionStart ?? fallbackPosition,
  }
}

const isUndoShortcut = (event: ReactKeyboardEvent<HTMLTextAreaElement>) =>
  event.key.toLowerCase() === 'z' &&
  (event.metaKey || event.ctrlKey) &&
  !event.shiftKey &&
  !event.altKey
