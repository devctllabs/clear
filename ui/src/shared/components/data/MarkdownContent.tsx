import { type ComponentProps } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useTranslation } from 'react-i18next'
import remarkGfm from 'remark-gfm'

import { cn } from '@shared/lib/utils'

type MarkdownContentProps = {
  activeClozeId?: string
  className?: string
  clozeMode?: 'all' | 'none' | 'review'
  markdown: string
  revealed?: boolean
}

type MarkdownNode = {
  children?: MarkdownNode[]
  data?: {
    hChildren?: Array<{ type: 'text'; value: string }>
    hName?: string
    hProperties?: Record<string, unknown>
  }
  type: string
  value?: string
}

type ClozeTransformOptions = {
  activeClozeId?: string
  mode: 'all' | 'review'
  revealed: boolean
}

type PendingCloze = {
  children: MarkdownNode[]
  id: string
}

type ReactMarkdownProps = ComponentProps<typeof ReactMarkdown>

const allowedMarkdownElements = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]

const activeClozeClassName =
  'inline-flex max-w-full items-center rounded-full border px-3 py-[0.16em] font-bold leading-[1.15] text-wrap-anywhere align-baseline'
const hiddenClozeClassName = `${activeClozeClassName} border-dashed border-border bg-muted text-muted-foreground`
const revealedClozeClassName = `${activeClozeClassName} border-border bg-muted text-foreground`
const clozeContentClassName = '[&_li]:leading-[1.95] [&_p]:leading-[1.95]'

const withoutMarkdownNode = <Props extends { node?: unknown }>(
  props: Props,
): Omit<Props, 'node'> => {
  const propsWithoutNode = { ...props }
  delete propsWithoutNode.node

  return propsWithoutNode as Omit<Props, 'node'>
}

const MarkdownTaskInput = ({
  className,
  ...props
}: ComponentProps<'input'> & { node?: unknown }) => {
  const { t } = useTranslation()

  return (
    <input
      aria-label={
        props['aria-label'] ??
        (props.checked
          ? t(($) => $.common.labels.completedTask)
          : t(($) => $.common.labels.incompleteTask))
      }
      className={cn('mr-2 align-middle accent-primary', className)}
      {...withoutMarkdownNode(props)}
      disabled
    />
  )
}

const markdownComponents = {
  a: ({ className, ...props }) => (
    <a
      className={cn(
        'text-wrap-anywhere font-bold text-foreground underline decoration-muted-foreground/40 underline-offset-4',
        className,
      )}
      rel="noreferrer"
      {...withoutMarkdownNode(props)}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'rounded-compact border border-border bg-muted/50 px-5 py-4 font-normal text-foreground',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        'text-wrap-anywhere rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-foreground',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'text-wrap-anywhere type-reading-heading type-reading-heading-lg text-primary',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'text-wrap-anywhere type-reading-heading type-reading-heading-md text-primary',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'text-wrap-anywhere type-reading-heading type-reading-heading-sm text-primary',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn('text-wrap-anywhere type-reading-heading text-lg text-foreground', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn('text-wrap-anywhere type-reading-heading text-base text-foreground', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        'text-wrap-anywhere type-label uppercase text-muted-foreground',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr
      className={cn('border-t border-border', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  img: ({ className, height, width, ...props }) => (
    <img
      className={cn('h-auto max-h-64 max-w-full rounded-md object-contain', className)}
      decoding="async"
      height={height ?? 360}
      loading="lazy"
      width={width ?? 640}
      {...withoutMarkdownNode(props)}
    />
  ),
  input: MarkdownTaskInput,
  li: ({ className, ...props }) => (
    <li
      className={cn('text-wrap-anywhere pl-1', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn('list-decimal space-y-2 pl-6', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn('text-wrap-anywhere', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        'max-w-full overflow-x-auto rounded-md bg-foreground p-4 text-sm text-primary-foreground',
        className,
      )}
      {...withoutMarkdownNode(props)}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="max-w-full overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-left text-sm', className)}
        {...withoutMarkdownNode(props)}
      />
    </div>
  ),
  tbody: ({ className, ...props }) => (
    <tbody className={className} {...withoutMarkdownNode(props)} />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn('border border-border px-3 py-2 align-top', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn('border border-border bg-muted px-3 py-2 font-bold', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
  thead: ({ className, ...props }) => (
    <thead className={className} {...withoutMarkdownNode(props)} />
  ),
  tr: ({ className, ...props }) => (
    <tr className={className} {...withoutMarkdownNode(props)} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn('list-disc space-y-2 pl-6', className)}
      {...withoutMarkdownNode(props)}
    />
  ),
} satisfies Components

export const MarkdownContent = ({
  activeClozeId,
  className,
  clozeMode = 'none',
  markdown,
  revealed = false,
}: MarkdownContentProps) => {
  const remarkPlugins: ReactMarkdownProps['remarkPlugins'] =
    clozeMode === 'none'
      ? [remarkGfm]
      : ([
          remarkGfm,
          [remarkCloze, { activeClozeId, mode: clozeMode, revealed }],
        ] as ReactMarkdownProps['remarkPlugins'])

  return (
    <div
      className={cn(
        'text-wrap-anywhere type-reading space-y-4 text-foreground',
        clozeMode !== 'none' && clozeContentClassName,
        className,
      )}
    >
      <ReactMarkdown
        allowedElements={allowedMarkdownElements}
        components={markdownComponents}
        remarkPlugins={remarkPlugins}
        skipHtml
        unwrapDisallowed
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

const remarkCloze = (options: ClozeTransformOptions) => (tree: MarkdownNode) => {
  transformClozeChildren(tree, options)
}

const transformClozeChildren = (
  node: MarkdownNode,
  options: ClozeTransformOptions,
) => {
  if (!node.children) {
    return
  }

  for (const child of node.children) {
    transformClozeChildren(child, options)
  }

  node.children = replaceClozeMarkers(node.children, options)
}

const replaceClozeMarkers = (
  children: MarkdownNode[],
  options: ClozeTransformOptions,
): MarkdownNode[] => {
  const nextChildren: MarkdownNode[] = []
  let pendingCloze: PendingCloze | null = null

  const appendNode = (node: MarkdownNode) => {
    if (pendingCloze) {
      pendingCloze.children.push(node)
      return
    }

    nextChildren.push(node)
  }

  const flushCloze = () => {
    if (!pendingCloze) {
      return
    }

    nextChildren.push(...createClozeNodes(pendingCloze, options))
    pendingCloze = null
  }

  for (const child of children) {
    if (child.type !== 'text' || typeof child.value !== 'string') {
      appendNode(child)
      continue
    }

    let cursor = 0

    while (cursor < child.value.length) {
      if (pendingCloze) {
        const closeIndex = child.value.indexOf('}}', cursor)

        if (closeIndex === -1) {
          appendText(pendingCloze.children, child.value.slice(cursor))
          cursor = child.value.length
          continue
        }

        appendText(pendingCloze.children, child.value.slice(cursor, closeIndex))
        cursor = closeIndex + 2
        flushCloze()
        continue
      }

      const openMatch = /\{\{(c\d+)::/g
      openMatch.lastIndex = cursor

      const match = openMatch.exec(child.value)

      if (!match) {
        appendText(nextChildren, child.value.slice(cursor))
        cursor = child.value.length
        continue
      }

      appendText(nextChildren, child.value.slice(cursor, match.index))
      pendingCloze = { children: [], id: match[1] }
      cursor = match.index + match[0].length
    }
  }

  if (pendingCloze) {
    nextChildren.push(createTextNode(`{{${pendingCloze.id}::`), ...pendingCloze.children)
  }

  return nextChildren
}

const createClozeNodes = (
  cloze: PendingCloze,
  options: ClozeTransformOptions,
): MarkdownNode[] => {
  if (options.mode === 'review' && cloze.id !== options.activeClozeId) {
    return cloze.children
  }

  const isRevealed = options.mode === 'all' || options.revealed
  const className = isRevealed ? revealedClozeClassName : hiddenClozeClassName

  return [
    {
      children: isRevealed ? cloze.children : [],
      data: {
        hChildren: isRevealed ? undefined : [{ type: 'text', value: '•••' }],
        hName: 'span',
        hProperties: {
          className,
          'data-cloze-id': cloze.id,
          'data-cloze-state': isRevealed ? 'revealed' : 'hidden',
        },
      },
      type: 'clearCloze',
    },
  ]
}

const appendText = (children: MarkdownNode[], value: string) => {
  if (value.length === 0) {
    return
  }

  children.push(createTextNode(value))
}

const createTextNode = (value: string): MarkdownNode => ({ type: 'text', value })
