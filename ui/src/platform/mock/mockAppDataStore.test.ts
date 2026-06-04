import { describe, expect, it, vi } from 'vitest'

import { mockContentSearchService } from '@platform/services/content-search/mock/contentSearchService'
import { mockDeckService } from '@platform/services/decks/mock/deckService'
import { mockFolderService } from '@platform/services/folders/mock/folderService'
import { mockNoteService } from '@platform/services/notes/mock/noteService'
import { mockReviewService } from '@platform/services/review/mock/reviewService'
import { mockTrashService } from '@platform/services/trash/mock/trashService'
import { mockSettingsService } from '@platform/services/settings/mock/settingsService'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'
import { mockWorkspaceService } from '@platform/services/workspaces/mock/workspaceService'

describe('mock services backed by app data store', () => {
  it('persists the seeded snapshot immediately when mock storage is empty', async () => {
    window.localStorage.clear()
    vi.resetModules()

    const { mockAppDataStore: reloadedStore } = await import('./mockAppDataStore')
    const persisted = window.localStorage.getItem('clear-ui:mock-state:v15')

    expect(persisted).not.toBeNull()

    const parsed = JSON.parse(persisted ?? '{}') as {
      folders?: Array<{ id: string; updatedAt: string }>
    }
    const persistedAcademic = parsed.folders?.find((folder) => folder.id === 'reading-notes')

    expect(persistedAcademic?.updatedAt).toBe(
      reloadedStore.getFolderById('reading-notes')?.updatedAt,
    )
  })

  it('replaces invalid mock storage with a valid seeded snapshot', async () => {
    window.localStorage.setItem('clear-ui:mock-state:v15', '{broken')
    vi.resetModules()

    const { mockAppDataStore: reloadedStore } = await import('./mockAppDataStore')
    const persisted = window.localStorage.getItem('clear-ui:mock-state:v15')

    expect(() => JSON.parse(persisted ?? '')).not.toThrow()

    const parsed = JSON.parse(persisted ?? '{}') as {
      folders?: Array<{ id: string; updatedAt: string }>
    }

    expect(parsed.folders?.some((folder) => folder.id === 'reading-notes')).toBe(true)
    expect(reloadedStore.getFolderById('reading-notes')).toBeDefined()
  })

  it('reuses the persisted mock snapshot across reload-like initialization', async () => {
    window.localStorage.clear()
    vi.resetModules()

    const { mockAppDataStore: firstStore } = await import('./mockAppDataStore')
    const firstUpdatedAt = firstStore.getFolderById('reading-notes')?.updatedAt
    const firstPersisted = window.localStorage.getItem('clear-ui:mock-state:v15')

    vi.resetModules()

    const { mockAppDataStore: secondStore } = await import('./mockAppDataStore')
    const secondUpdatedAt = secondStore.getFolderById('reading-notes')?.updatedAt
    const secondPersisted = window.localStorage.getItem('clear-ui:mock-state:v15')

    expect(firstUpdatedAt).toBeDefined()
    expect(secondUpdatedAt).toBe(firstUpdatedAt)
    expect(secondPersisted).toBe(firstPersisted)
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
        'political-thought',
        'world-history',
      ])
      expect(rootDecks.value.every((deck) => deck.parentId === 'independent-study')).toBe(true)
    }

    if (readingNotesDecks.ok) {
      expect(readingNotesDecks.value.map((deck) => deck.id)).toEqual(['reading-review-queue'])
      expect(readingNotesDecks.value[0]).not.toHaveProperty('detail')
    }

    if (referenceDecks.ok) {
      expect(referenceDecks.value.map((deck) => deck.id)).toEqual(['statistics-basics'])
    }

    if (rootDecks.ok && readingNotesDecks.ok && referenceDecks.ok) {
      const rootIds = new Set(rootDecks.value.map((deck) => deck.id))
      const placedIds = [...readingNotesDecks.value, ...referenceDecks.value].map((deck) => deck.id)

      expect(placedIds.some((deckId) => rootIds.has(deckId))).toBe(false)
    }

    const allSeededFolders = [
      ...mockAppDataStore.listWorkspaceFolders('independent-study'),
      ...mockAppDataStore.listFoldersInFolder('reading-notes'),
      ...mockAppDataStore.listFoldersInFolder('history'),
      ...mockAppDataStore.listFoldersInFolder('reference'),
    ]
    const allSeededDecks = [
      ...mockAppDataStore.listWorkspaceDecks('independent-study'),
      ...mockAppDataStore.listDecksInFolder('reading-notes'),
      ...mockAppDataStore.listDecksInFolder('reference'),
      ...mockAppDataStore.listDecksInFolder('psychology'),
      ...mockAppDataStore.listDecksInFolder('philosophy'),
      ...mockAppDataStore.listDecksInFolder('writing'),
      ...mockAppDataStore.listDecksInFolder('methods'),
    ]

    expect(allSeededFolders).toHaveLength(7)
    expect(allSeededFolders.every((folder) => folder.parentId.length > 0)).toBe(true)
    expect(allSeededDecks).toHaveLength(11)
    expect(allSeededDecks.every((deck) => deck.parentId.length > 0)).toBe(true)
    expect(new Set(allSeededDecks.map((deck) => deck.id)).size).toBe(allSeededDecks.length)

    if (worldHistory.ok) {
      expect(worldHistory.value).toMatchObject({
        dueToday: 9,
        progress: 71,
        totalNotes: 7,
      })
    }

    if (notes.ok) {
      expect(notes.value.slice(0, 3).map((note) => note.id)).toEqual([
        'industrial-revolution-causes',
        'collective-memory',
        'constitutional-crisis',
      ])
      expect(notes.value[0]).not.toHaveProperty('editor')
      expect(notes.value[0]).not.toHaveProperty('bodySegments')
      expect(notes.value[0]).not.toHaveProperty('cards')
    }

    if (civicNotes.ok) {
      expect(civicNotes.value.map((note) => note.id)).toContain('base-rates')
    }

    if (trash.ok) {
      expect(trash.value.items.map((item) => item.id)).toEqual([
        'drafting-patterns',
        'sampling-error-notes',
        'drafts',
        'completed-reading-log',
        'linguistic-atlas',
      ])
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

    expect(decksByDue.ok).toBe(true)
    expect(foldersByTitleDesc.ok).toBe(true)
    expect(notesByTitle.ok).toBe(true)

    if (decksByDue.ok) {
      expect(decksByDue.value.map((deck) => deck.id)).toEqual([
        'world-history',
        'cognitive-biases',
        'political-thought',
      ])
    }

    if (foldersByTitleDesc.ok) {
      expect(foldersByTitleDesc.value.map((folder) => folder.id)).toEqual([
        'reference',
        'reading-notes',
      ])
    }

    if (notesByTitle.ok) {
      expect(notesByTitle.value.slice(0, 3).map((note) => note.id)).toEqual([
        'atlantic-revolutions-outline',
        'civil-rights-movement-cards',
        'cold-war-detente-recap',
      ])
    }
  })

  it('matches card-based review progression before summary', async () => {
    const first = await mockReviewService.start('world-history')

    expect(first.ok).toBe(true)
    if (!first.ok || first.value.mode !== 'due' || !first.value.currentCard) {
      return
    }

    expect(first.value.currentCard.id).toBe('industrial-revolution-causes:basic')
    expect(first.value.plannedCount).toBe(8)

    const second = await mockReviewService.grade(
      first.value.id,
      first.value.currentCard.id,
      'good',
    )

    expect(second.ok).toBe(true)
    expect(second.ok ? second.value.currentCard?.id : undefined).toBe('collective-memory:c1')
    expect(second.ok && second.value.mode === 'due' ? second.value.plannedCount : undefined).toBe(8)
    expect(second.ok ? second.value.reviewedCount : undefined).toBe(1)

    const third = await mockReviewService.grade(
      first.value.id,
      'collective-memory:c1',
      'good',
    )

    expect(third.ok).toBe(true)
    expect(third.ok ? third.value.currentCard?.id : undefined).toBe('collective-memory:c2')

    const summary = await mockReviewService.get(first.value.id)

    expect(summary.ok).toBe(true)
    if (summary.ok) {
      expect(summary.value.reviewedCount).toBe(2)
      expect(summary.value.mode === 'due' ? summary.value.plannedCount : undefined).toBe(8)
      expect(summary.value.durationSeconds).toBe(0)
      expect(summary.value.mode === 'due' ? summary.value.status : undefined).toBe('active')
    }
  })

  it('recreates removed cloze ids as fresh derived cards without changing deck notes', async () => {
    mockAppDataStore.reset()

    try {
      const beforeDeck = await mockDeckService.getById('world-history')
      const beforeNote = await mockNoteService.getById('world-history', 'collective-memory')

      expect(beforeDeck.ok ? beforeDeck.value.totalNotes : undefined).toBe(7)
      expect(
        beforeNote.ok && beforeNote.value.kind === 'cloze'
          ? beforeNote.value.cards[0]
          : undefined,
      ).toMatchObject({
        id: 'collective-memory:c1',
        progress: 74,
      })

      await mockNoteService.update('collective-memory', {
        deckId: 'world-history',
        editor: {
          body: 'Collective memory shapes historical evidence and public narratives across generations.',
        },
        kind: 'cloze',
        title: 'Collective Memory',
      })

      const removed = await mockNoteService.getById('world-history', 'collective-memory')

      expect(
        removed.ok && removed.value.kind === 'cloze' ? removed.value.cards : undefined,
      ).toEqual([])
      expect(removed.ok ? removed.value.progress : undefined).toBe(0)
      expect(removed.ok ? removed.value.status : undefined).toBe('in-progress')

      await mockNoteService.update('collective-memory', {
        deckId: 'world-history',
        editor: {
          body:
            'Collective memory shapes {{c1::new evidence}} and public narratives across generations.',
        },
        kind: 'cloze',
        title: 'Collective Memory',
      })

      const readded = await mockNoteService.getById('world-history', 'collective-memory')
      const afterDeck = await mockDeckService.getById('world-history')
      const freshCard =
        readded.ok && readded.value.kind === 'cloze' ? readded.value.cards[0] : undefined

      expect(freshCard).toMatchObject({
        clozeId: 'c1',
        progress: 0,
        title: 'new evidence',
      })
      expect(freshCard?.id).not.toBe('collective-memory:c1')
      expect(afterDeck.ok ? afterDeck.value.totalNotes : undefined).toBe(7)
    } finally {
      mockAppDataStore.reset()
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

    const restored = await mockTrashService.restoreItem('sampling-error-notes')
    expect(restored.ok).toBe(true)
    const afterRestore = await mockTrashService.list()
    expect(afterRestore.ok ? afterRestore.value.items.length : undefined).toBe(4)

    const emptied = await mockTrashService.empty()
    expect(emptied.ok).toBe(true)
    expect(emptied.ok ? emptied.value.items : undefined).toEqual([])
  })
})
