import { describe, expect, it, vi } from 'vitest'

import { mockContentSearchService } from '@platform/services/content-search/mock/contentSearchService'
import { mockDeckService } from '@platform/services/decks/mock/deckService'
import { mockFolderService } from '@platform/services/folders/mock/folderService'
import { mockNoteService } from '@platform/services/notes/mock/noteService'
import { mockReviewService } from '@platform/services/review/mock/reviewService'
import { mockTrashService } from '@platform/services/trash/mock/trashService'
import { mockSettingsService } from '@platform/services/settings/mock/settingsService'
import {
  mockApi,
  mockStateRepository,
  mockStorageKey,
} from '@platform/mock/mockApi'
import { mockWorkspaceService } from '@platform/services/workspaces/mock/workspaceService'

describe('mock API services', () => {
  it('persists the seeded snapshot immediately when mock storage is empty', async () => {
    window.localStorage.clear()
    vi.resetModules()

    const {
      mockApi: reloadedApi,
      mockStorageKey: reloadedStorageKey,
    } = await import('./mockApi')
    const persisted = window.localStorage.getItem(reloadedStorageKey)

    expect(persisted).not.toBeNull()

    const parsed = JSON.parse(persisted ?? '{}') as {
      folders?: Array<{ id: string; updatedAt: string }>
    }
    const persistedReadingNotes = parsed.folders?.find((folder) => folder.id === 'reading-notes')

    expect(persistedReadingNotes?.updatedAt).toBe(
      reloadedApi.foldersService.getFolder('reading-notes').updatedAt,
    )
  })

  it('replaces invalid mock storage with a valid seeded snapshot', async () => {
    window.localStorage.setItem(mockStorageKey, '{broken')
    vi.resetModules()

    const { mockApi: reloadedApi } = await import('./mockApi')
    const persisted = window.localStorage.getItem(mockStorageKey)

    expect(() => JSON.parse(persisted ?? '')).not.toThrow()

    const parsed = JSON.parse(persisted ?? '{}') as {
      folders?: Array<{ id: string; updatedAt: string }>
    }

    expect(parsed.folders?.some((folder) => folder.id === 'reading-notes')).toBe(true)
    expect(reloadedApi.foldersService.getFolder('reading-notes')).toBeDefined()
  })

  it('reuses the persisted mock snapshot across reload-like initialization', async () => {
    window.localStorage.clear()
    vi.resetModules()

    const { mockApi: firstApi } = await import('./mockApi')
    const firstUpdatedAt = firstApi.foldersService.getFolder('reading-notes').updatedAt
    const firstPersisted = window.localStorage.getItem(mockStorageKey)

    vi.resetModules()

    const { mockApi: secondApi } = await import('./mockApi')
    const secondUpdatedAt = secondApi.foldersService.getFolder('reading-notes').updatedAt
    const secondPersisted = window.localStorage.getItem(mockStorageKey)

    expect(firstUpdatedAt).toBeDefined()
    expect(secondUpdatedAt).toBe(firstUpdatedAt)
    expect(JSON.parse(secondPersisted ?? '{}')).toEqual(JSON.parse(firstPersisted ?? '{}'))
  })

  it('lists visible workspaces with an active workspace', async () => {
    const result = await mockWorkspaceService.list()
    const active = await mockWorkspaceService.getActiveId()

    expect(result.ok).toBe(true)
    expect(active.ok).toBe(true)
    if (result.ok) {
      expect(result.value.activeWorkspaceId).toBe(active.ok ? active.value : null)
      expect(
        active.ok
          ? result.value.workspaces.some((workspace) => workspace.id === active.value)
          : false,
      ).toBe(true)
      expect(result.value.workspaces.map((workspace) => workspace.id)).toContain(
        'independent-study',
      )
    }
  })

  it('searches workspace content by scope', async () => {
    const result = await mockContentSearchService.search(
      { kind: 'workspace', workspaceId: 'independent-study' },
      'history',
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      const deckGroup = result.value.find((group) => group.kind === 'deck')
      const deckResult = deckGroup?.results.find((candidate) => candidate.id === 'world-history')

      expect(deckGroup).toBeDefined()
      expect(deckResult).toMatchObject({
        kind: 'deck',
        locationPath: ['Independent Study'],
        workspaceId: 'independent-study',
      })
      expect(deckResult).not.toHaveProperty('deckId')
      expect(deckResult).not.toHaveProperty('folderId')
      expect(deckResult).not.toHaveProperty('path')
      expect(deckResult).not.toHaveProperty('params')
      expect(deckResult).not.toHaveProperty('to')
    }
  })

  it('uses the clear dashboard seed structure', async () => {
    const rootFolders = await mockFolderService.listWorkspaceRoot('independent-study')
    const rootDecks = await mockDeckService.listWorkspaceRoot('independent-study')
    const readingNotesDecks = await mockDeckService.listFolderChildren('reading-notes')
    const referenceDecks = await mockDeckService.listFolderChildren('reference')
    const worldHistory = await mockDeckService.getById('world-history')
    const notes = await mockNoteService.listByDeck('world-history')
    const civicNotes = await mockNoteService.listByDeck('statistics-basics')
    const trash = await mockTrashService.list()

    expect(rootFolders.ok).toBe(true)
    expect(rootDecks.ok).toBe(true)
    expect(readingNotesDecks.ok).toBe(true)
    expect(referenceDecks.ok).toBe(true)
    expect(worldHistory.ok).toBe(true)
    expect(notes.ok).toBe(true)
    expect(civicNotes.ok).toBe(true)
    expect(trash.ok).toBe(true)

    if (rootFolders.ok) {
      expect(rootFolders.value.map((folder) => folder.id)).toEqual([
        'reading-notes',
        'reference',
      ])
      expect(rootFolders.value.every((folder) => folder.parentId === 'independent-study')).toBe(
        true,
      )
    }

    if (rootDecks.ok) {
      expect(rootDecks.value.map((deck) => deck.id)).toEqual([
        'cognitive-biases',
        'world-history',
        'political-thought',
      ])
      expect(rootDecks.value.every((deck) => deck.parentId === 'independent-study')).toBe(true)
    }

    if (readingNotesDecks.ok) {
      expect(readingNotesDecks.value).toEqual([])
    }

    if (referenceDecks.ok) {
      expect(referenceDecks.value.map((deck) => deck.id)).toEqual(['statistics-basics'])
    }

    if (rootDecks.ok && readingNotesDecks.ok && referenceDecks.ok) {
      const rootIds = new Set(rootDecks.value.map((deck) => deck.id))
      const placedIds = [...readingNotesDecks.value, ...referenceDecks.value].map((deck) => deck.id)

      expect(placedIds.some((deckId) => rootIds.has(deckId))).toBe(false)
    }

    const snapshot = mockStateRepository.snapshot()
    const visibleFolders = snapshot.folders.filter((folder) => !folder.deletedAt)
    const visibleDecks = snapshot.decks.filter((deck) => !deck.deletedAt)

    expect(mockApi.stateStore).toBe(mockStateRepository)
    expect(visibleFolders).toHaveLength(3)
    expect(visibleFolders.every((folder) => folder.parentId.length > 0)).toBe(true)
    expect(visibleDecks).toHaveLength(4)
    expect(visibleDecks.every((deck) => deck.parentId.length > 0)).toBe(true)
    expect(new Set(visibleDecks.map((deck) => deck.id)).size).toBe(visibleDecks.length)

    if (worldHistory.ok) {
      expect(worldHistory.value).toMatchObject({
        dueToday: 1,
        progress: 66,
        totalNotes: 2,
      })
    }

    if (notes.ok) {
      expect(notes.value.map((note) => note.id)).toEqual([
        'industrial-revolution-causes',
        'postwar-institutions',
      ])
      expect(notes.value[0]).not.toHaveProperty('editor')
      expect(notes.value[0]).not.toHaveProperty('bodySegments')
      expect(notes.value[0]).not.toHaveProperty('cards')
    }

    if (civicNotes.ok) {
      expect(civicNotes.value.map((note) => note.id)).toEqual(['sampling-error'])
    }

    if (trash.ok) {
      expect(trash.value.items.map((item) => item.id)).toEqual(['base-rates'])
    }
  })

  it('sorts list results in mock services', async () => {
    const decksByDue = await mockDeckService.listWorkspaceRoot('independent-study', {
      direction: 'desc',
      field: 'dueToday',
    })
    const foldersByTitleDesc = await mockFolderService.listWorkspaceRoot(
      'independent-study',
      { direction: 'desc', field: 'title' },
    )
    const notesByTitle = await mockNoteService.listByDeck(
      'world-history',
      { direction: 'asc', field: 'title' },
    )
    const notesByProgress = await mockNoteService.listByDeck(
      'world-history',
      { direction: 'asc', field: 'progress' },
    )

    expect(decksByDue.ok).toBe(true)
    expect(foldersByTitleDesc.ok).toBe(true)
    expect(notesByTitle.ok).toBe(true)
    expect(notesByProgress.ok).toBe(true)

    if (decksByDue.ok) {
      expect(decksByDue.value.map((deck) => deck.id)).toEqual([
        'cognitive-biases',
        'political-thought',
        'world-history',
      ])
    }

    if (foldersByTitleDesc.ok) {
      expect(foldersByTitleDesc.value.map((folder) => folder.id)).toEqual([
        'reference',
        'reading-notes',
      ])
    }

    if (notesByTitle.ok) {
      expect(notesByTitle.value.map((note) => note.id)).toEqual([
        'industrial-revolution-causes',
        'postwar-institutions',
      ])
    }

    if (notesByProgress.ok) {
      expect(notesByProgress.value.map((note) => note.id)).toEqual([
        'postwar-institutions',
        'industrial-revolution-causes',
      ])
    }
  })

  it('matches card-based review progression before summary', async () => {
    const first = await mockReviewService.start('world-history')

    expect(first.ok).toBe(true)
    if (!first.ok || first.value.mode !== 'due' || !first.value.currentCard) {
      return
    }

    expect(first.value.currentCard.id).toBe('industrial-revolution-causes')
    expect(first.value.plannedCount).toBe(1)

    const second = await mockReviewService.grade(
      first.value.id,
      first.value.currentCard.id,
      'good',
    )

    expect(second.ok).toBe(true)
    expect(second.ok ? second.value.currentCard?.id : undefined).toBeUndefined()
    expect(second.ok && second.value.mode === 'due' ? second.value.plannedCount : undefined).toBe(1)
    expect(second.ok ? second.value.reviewedCount : undefined).toBe(1)

    const summary = await mockReviewService.get(first.value.id)

    expect(summary.ok).toBe(true)
    if (summary.ok) {
      expect(summary.value.reviewedCount).toBe(1)
      expect(summary.value.mode === 'due' ? summary.value.plannedCount : undefined).toBe(1)
      expect(summary.value.durationSeconds).toBe(0)
      expect(summary.value.mode === 'due' ? summary.value.status : undefined).toBe('completed')
    }
  })

  it('derives deck counters from visible notes and review cards', async () => {
    await mockStateRepository.reset()

    try {
      const before = await mockDeckService.getById('world-history')

      expect(before.ok ? before.value : undefined).toMatchObject({
        dueToday: 1,
        progress: 66,
        totalNotes: 2,
      })

      const review = await mockReviewService.start('world-history')
      expect(review.ok && review.value.mode === 'due' ? review.value.plannedCount : undefined).toBe(1)

      if (!review.ok || review.value.mode !== 'due' || !review.value.currentCard) {
        throw new Error('Expected world-history to start a due review.')
      }

      await mockReviewService.grade(review.value.id, review.value.currentCard.id, 'good')

      const afterGrade = await mockDeckService.getById('world-history')
      expect(afterGrade.ok ? afterGrade.value : undefined).toMatchObject({
        dueToday: 0,
        progress: 79,
        totalNotes: 2,
      })

      const created = await mockNoteService.create({
        deckId: 'world-history',
        editor: { back: 'Back draft', front: 'Front draft' },
        kind: 'basic',
        title: 'New Draft Note',
      })
      expect(created.ok).toBe(true)

      const afterCreate = await mockDeckService.getById('world-history')
      expect(afterCreate.ok ? afterCreate.value : undefined).toMatchObject({
        dueToday: 1,
        progress: 52,
        totalNotes: 3,
      })

      await mockNoteService.delete('industrial-revolution-causes')

      const afterDelete = await mockDeckService.getById('world-history')
      expect(afterDelete.ok ? afterDelete.value : undefined).toMatchObject({
        dueToday: 1,
        progress: 29,
        totalNotes: 2,
      })

      await mockTrashService.restoreItem('industrial-revolution-causes')

      const afterRestore = await mockDeckService.getById('world-history')
      expect(afterRestore.ok ? afterRestore.value : undefined).toMatchObject({
        dueToday: 1,
        progress: 52,
        totalNotes: 3,
      })
    } finally {
      await mockStateRepository.reset()
    }
  })

  it('recreates removed cloze ids as fresh derived cards without changing deck notes', async () => {
    await mockStateRepository.reset()

    try {
      const beforeDeck = await mockDeckService.getById('cognitive-biases')
      const beforeNote = await mockNoteService.getById('cognitive-biases', 'availability-heuristic')

      expect(beforeDeck.ok ? beforeDeck.value.totalNotes : undefined).toBe(3)
      expect(
        beforeNote.ok && beforeNote.value.kind === 'cloze'
          ? beforeNote.value.cards[0]
          : undefined,
      ).toMatchObject({
        id: 'availability-heuristic-card-1',
        progress: 53,
      })

      await mockNoteService.update('availability-heuristic', {
        deckId: 'cognitive-biases',
        editor: {
          body: 'Availability bias makes vivid examples feel more common than they really are.',
        },
        kind: 'cloze',
        title: 'Availability Heuristic',
      })

      const removed = await mockNoteService.getById('cognitive-biases', 'availability-heuristic')

      expect(
        removed.ok && removed.value.kind === 'cloze' ? removed.value.cards : undefined,
      ).toHaveLength(1)
      expect(removed.ok ? removed.value.progress : undefined).toBe(0)
      expect(removed.ok ? removed.value.status : undefined).toBe('in-progress')

      await mockNoteService.update('availability-heuristic', {
        deckId: 'cognitive-biases',
        editor: {
          body:
            'Availability bias makes {{c1::fresh examples}} feel more common than they really are.',
        },
        kind: 'cloze',
        title: 'Availability Heuristic',
      })

      const readded = await mockNoteService.getById('cognitive-biases', 'availability-heuristic')
      const afterDeck = await mockDeckService.getById('cognitive-biases')
      const freshCard =
        readded.ok && readded.value.kind === 'cloze' ? readded.value.cards[0] : undefined

      expect(freshCard).toMatchObject({
        clozeId: 'c1',
        progress: 0,
        title: 'Availability Heuristic',
      })
      expect(freshCard?.id).not.toBe('availability-heuristic-card-1')
      expect(afterDeck.ok ? afterDeck.value.totalNotes : undefined).toBe(3)
    } finally {
      await mockStateRepository.reset()
    }
  })

  it('creates and updates workspace resources through split mock services', async () => {
    const workspace = await mockWorkspaceService.create({
      description: 'Draft workspace description',
      icon: 'layers-3',
      title: 'Draft Workspace',
    })

    expect(workspace.ok).toBe(true)
    if (!workspace.ok) {
      return
    }

    const folder = await mockFolderService.create({
      description: 'Draft folder description',
      name: 'Draft Folder',
      parentId: workspace.value.id,
    })

    expect(folder.ok).toBe(true)
    if (!folder.ok) {
      return
    }

    const deck = await mockDeckService.create({
      description: 'Draft deck description',
      icon: 'brain',
      parentId: folder.value.id,
      title: 'Draft Deck',
    })

    expect(deck.ok).toBe(true)
    if (!deck.ok) {
      return
    }

    const note = await mockNoteService.create({
      deckId: deck.value.id,
      editor: { back: 'Back draft', front: 'Front draft' },
      kind: 'basic',
      title: 'Draft Note',
    })

    expect(note.ok).toBe(true)
    expect(note.ok ? note.value : undefined).toEqual({
      deckId: deck.value.id,
      id: 'note-1',
    })

    const updatedDeck = await mockDeckService.update(deck.value.id, {
      description: 'Updated deck description',
      icon: 'languages',
      parentId: folder.value.id,
      title: 'Updated Deck',
    })

    expect(updatedDeck.ok).toBe(true)
    expect(updatedDeck.ok ? updatedDeck.value.title : undefined).toBe('Updated Deck')
  })

  it('persists settings and mutates trash through explicit mock services', async () => {
    const defaults = await mockSettingsService.getDefaults()
    expect(defaults.ok).toBe(true)
    if (!defaults.ok) {
      return
    }

    const written = await mockSettingsService.write({
      ...defaults.value,
      dailyNewLimit: 42,
      language: 'fr',
    })

    expect(written.ok).toBe(true)
    const read = await mockSettingsService.read()
    expect(read.ok ? read.value.dailyNewLimit : undefined).toBe(42)
    expect(read.ok ? read.value.language : undefined).toBe('fr')

    const reset = await mockSettingsService.reset()
    expect(reset.ok ? reset.value.dailyNewLimit : undefined).toBe(defaults.value.dailyNewLimit)

    const restored = await mockTrashService.restoreItem('base-rates')
    expect(restored.ok).toBe(true)
    const afterRestore = await mockTrashService.list()
    expect(afterRestore.ok ? afterRestore.value.items.length : undefined).toBe(0)

    const emptied = await mockTrashService.empty()
    expect(emptied.ok).toBe(true)
    expect(emptied.ok ? emptied.value.items : undefined).toEqual([])
  })
})
