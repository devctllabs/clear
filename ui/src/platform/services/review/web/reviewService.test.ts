import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type {
  ReviewCard,
  ReviewSession,
  ReviewStartResult,
} from '@api-generated/clear-api'
import { apiUrl, setupWebApiMsw } from '@/test/web-api-msw'

import { webReviewService } from './reviewService'

const server = setupWebApiMsw()

const basicCard = {
  back: 'Back',
  front: 'Front',
  id: 'card-1',
  kind: 'basic',
  progress: 42,
} satisfies ReviewCard

const dueSession = {
  currentCard: basicCard,
  deckId: 'world-history',
  durationSeconds: 120,
  id: 'review-1',
  mode: 'due',
  plannedCount: 10,
  reviewedCount: 3,
  startedAt: '2026-05-20T12:00:00.000Z',
  status: 'active',
} satisfies ReviewSession

const practiceSession = {
  currentCard: {
    body: 'The {{c1::Industrial Revolution}} started in Britain.',
    clozeId: 'c1',
    id: 'card-2',
    kind: 'cloze',
    progress: 12,
  },
  deckId: 'world-history',
  durationSeconds: 180,
  id: 'review-2',
  mode: 'practice',
  reviewedCount: 5,
  startedAt: '2026-05-20T13:00:00.000Z',
} satisfies ReviewSession

const unavailableStart = {
  mode: 'unavailable',
  reason: 'empty-deck',
} satisfies ReviewStartResult

describe('webReviewService', () => {
  it('starts review sessions through the web API', async () => {
    server.use(
      http.post(apiUrl('/decks/:deckId/reviews'), ({ params }) => {
        expect(params.deckId).toBe('empty-deck')

        return HttpResponse.json(unavailableStart, { status: 201 })
      }),
    )

    await expect(webReviewService.start('empty-deck')).resolves.toEqual({
      ok: true,
      value: unavailableStart,
    })
  })

  it('loads due review sessions through the web API', async () => {
    server.use(
      http.get(apiUrl('/reviews/:reviewId'), ({ params }) => {
        expect(params.reviewId).toBe(dueSession.id)

        return HttpResponse.json(dueSession)
      }),
    )

    await expect(webReviewService.get(dueSession.id)).resolves.toEqual({
      ok: true,
      value: dueSession,
    })
  })

  it('grades review cards through the web API', async () => {
    server.use(
      http.post(
        apiUrl('/reviews/:reviewId/cards/:cardId/grade'),
        async ({ params, request }) => {
          expect(params.reviewId).toBe(practiceSession.id)
          expect(params.cardId).toBe('card-2')
          expect(await request.json()).toEqual({ grade: 'good' })

          return HttpResponse.json(practiceSession)
        },
      ),
    )

    await expect(
      webReviewService.grade(practiceSession.id, 'card-2', 'good'),
    ).resolves.toEqual({
      ok: true,
      value: practiceSession,
    })
  })
})
