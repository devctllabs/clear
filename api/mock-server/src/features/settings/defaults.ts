import type { SettingsRecord } from '../../generated/mock-admin/contract/index.ts'

export const DEFAULT_SETTINGS = {
  dailyNewLimit: 20,
  dailyReviewLimit: 100,
  fsrsParams: [0.212, 1.2931],
  fsrsRetention: 90,
  language: 'en-US',
  masteryHorizonDays: 30,
  newCardsOrder: 'before_review',
  timezone: 'auto',
} satisfies SettingsRecord
