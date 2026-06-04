import { describe, expect, it } from 'vitest'

import type { Result } from '@shared/errors'

import { createBasicNoteDetail, createBasicReviewCard, createDeck, createFolder } from './fixtures'
import {
  createDeckService,
  createFolderService,
  createNoteService,
  createReviewService,
  unavailableError,
} from './page-services'

const expectOkValue = <T>(result: Result<T>): T => {
  expect(result.ok).toBe(true)

  if (!result.ok) {
    throw new Error(result.error.message)
  }

  return result.value
}

describe('storybook page services', () => {
  it('sorts fake list results by the requested preference', async () => {
    const workspaceId = 'storybook-workspace'
    const folderId = 'storybook-folder'
    const deckId = 'storybook-deck'

    const folderService = createFolderService({
      folders: [
        createFolder({
          id: 'alpha-folder',
          name: 'Alpha Folder',
          parentId: folderId,
          updatedAt: '2026-01-03T00:00:00.000Z',
          workspaceId,
        }),
        createFolder({
          id: 'gamma-folder',
          name: 'Gamma Folder',
          parentId: folderId,
          updatedAt: '2026-01-01T00:00:00.000Z',
          workspaceId,
        }),
        createFolder({
          id: 'beta-folder',
          name: 'Beta Folder',
          parentId: folderId,
          updatedAt: '2026-01-02T00:00:00.000Z',
          workspaceId,
        }),
      ],
    })
    const deckService = createDeckService({
      decks: [
        createDeck({
          dueToday: 4,
          parentId: folderId,
          id: 'low-due-deck',
          title: 'Low Due Deck',
          updatedAt: '2026-01-02T00:00:00.000Z',
          workspaceId,
        }),
        createDeck({
          dueToday: 18,
          parentId: folderId,
          id: 'high-due-deck',
          title: 'High Due Deck',
          updatedAt: '2026-01-01T00:00:00.000Z',
          workspaceId,
        }),
        createDeck({
          dueToday: 9,
          parentId: folderId,
          id: 'mid-due-deck',
          title: 'Mid Due Deck',
          updatedAt: '2026-01-03T00:00:00.000Z',
          workspaceId,
        }),
      ],
    })
    const noteService = createNoteService({
      noteDetails: [
        createBasicNoteDetail({
          deckId,
          id: 'zeta-note',
          title: 'Zeta Note',
          updatedAt: '2026-01-02T00:00:00.000Z',
        }),
        createBasicNoteDetail({
          deckId,
          id: 'alpha-note',
          title: 'Alpha Note',
          updatedAt: '2026-01-03T00:00:00.000Z',
        }),
        createBasicNoteDetail({
          deckId,
          id: 'middle-note',
          title: 'Middle Note',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      ],
    })

    const foldersByDefault = expectOkValue(
      await folderService.listFolderChildren(folderId),
    )
    const foldersByTitleDesc = expectOkValue(
      await folderService.listFolderChildren(folderId, {
        direction: 'desc',
        field: 'title',
      }),
    )
    const decksByDueTodayDesc = expectOkValue(
      await deckService.listFolderChildren(folderId, {
        direction: 'desc',
        field: 'dueToday',
      }),
    )
    const notesByUpdatedDesc = expectOkValue(
      await noteService.listByDeck(deckId, {
        direction: 'desc',
        field: 'updated',
      }),
    )

    expect(foldersByDefault.map((folder) => folder.id)).toEqual([
      'alpha-folder',
      'beta-folder',
      'gamma-folder',
    ])
    expect(foldersByTitleDesc.map((folder) => folder.id)).toEqual([
      'gamma-folder',
      'beta-folder',
      'alpha-folder',
    ])
    expect(decksByDueTodayDesc.map((deck) => deck.id)).toEqual([
      'high-due-deck',
      'mid-due-deck',
      'low-due-deck',
    ])
    expect(notesByUpdatedDesc.map((note) => note.id)).toEqual([
      'alpha-note',
      'zeta-note',
      'middle-note',
    ])
  })

  it('models review page state transitions', async () => {
    const firstCard = createBasicReviewCard({
      id: 'first-review-note:basic',
    })
    const nextCard = createBasicReviewCard({
      id: 'next-review-note:basic',
    })
    const reviewService = createReviewService({
      firstReviewable: firstCard,
      nextReviewable: nextCard,
      summary: {
        completedAt: '2026-05-16T12:18:00.000Z',
        deckId: 'world-history',
        durationSeconds: 1080,
        id: 'world-history-review',
        mode: 'due',
        plannedCount: 48,
        reviewedCount: 32,
        startedAt: '2026-05-16T12:00:00.000Z',
        status: 'completed',
      },
    })

    const started = expectOkValue(await reviewService.start('world-history'))
    if (started.mode === 'unavailable') {
      throw new Error('Expected review session')
    }
    const graded = expectOkValue(await reviewService.grade(started.id, firstCard.id, 'good'))
    const summary = expectOkValue(await reviewService.get(started.id))

    expect(started.currentCard?.id).toBe('first-review-note:basic')
    expect(started.mode === 'due' ? started.plannedCount : undefined).toBe(2)
    expect(graded.currentCard?.id).toBe('next-review-note:basic')
    expect(graded).toMatchObject({
      mode: 'due',
      reviewedCount: 1,
    })
    expect(summary).toMatchObject({
      mode: 'due',
      reviewedCount: 1,
    })
  })

  it('can fail folder path lookups without failing other folder reads', async () => {
    const workspaceId = 'storybook-workspace'
    const folderId = 'storybook-folder'
    const pathError = unavailableError('Folder path is temporarily unavailable.')
    const folderService = createFolderService({
      folders: [
        createFolder({
          id: folderId,
          name: 'Storybook Folder',
          parentId: workspaceId,
          workspaceId,
        }),
      ],
      pathError,
    })

    const pathResult = await folderService.getPath(folderId)
    const folder = expectOkValue(await folderService.getById(folderId))
    const folders = expectOkValue(
      await folderService.listWorkspaceRoot(workspaceId),
    )

    expect(pathResult.ok).toBe(false)
    expect(folder.id).toBe(folderId)
    expect(folders.map((candidate) => candidate.id)).toEqual([folderId])
  })

  it('can fail list refreshes after initial list data is loaded', async () => {
    const workspaceId = 'storybook-workspace'
    const folderId = 'storybook-folder'
    const deckId = 'storybook-deck'
    const refreshError = unavailableError('List refresh is temporarily unavailable.')
    const folderService = createFolderService({
      folders: [
        createFolder({
          id: 'child-folder',
          name: 'Child Folder',
          parentId: folderId,
          workspaceId,
        }),
      ],
      listRefreshError: refreshError,
    })
    const deckService = createDeckService({
      decks: [
        createDeck({
          parentId: folderId,
          id: deckId,
          title: 'Storybook Deck',
          workspaceId,
        }),
      ],
      listRefreshError: refreshError,
    })
    const noteService = createNoteService({
      listRefreshError: refreshError,
      noteDetails: [
        createBasicNoteDetail({
          deckId,
          id: 'storybook-note',
          title: 'Storybook Note',
        }),
      ],
    })

    expect(
      expectOkValue(await folderService.listFolderChildren(folderId)).map(
        (folder) => folder.id,
      ),
    ).toEqual(['child-folder'])
    expect(
      expectOkValue(await deckService.listFolderChildren(folderId)).map(
        (deck) => deck.id,
      ),
    ).toEqual([deckId])
    expect(
      expectOkValue(await noteService.listByDeck(deckId)).map((note) => note.id),
    ).toEqual(['storybook-note'])

    await expect(folderService.listFolderChildren(folderId)).resolves.toEqual({
      error: refreshError,
      ok: false,
    })
    await expect(deckService.listFolderChildren(folderId)).resolves.toEqual({
      error: refreshError,
      ok: false,
    })
    await expect(noteService.listByDeck(deckId)).resolves.toEqual({
      error: refreshError,
      ok: false,
    })

    expectOkValue(await folderService.delete('child-folder'))
    expectOkValue(await deckService.delete(deckId))
    expectOkValue(await noteService.delete('storybook-note'))
  })
})
