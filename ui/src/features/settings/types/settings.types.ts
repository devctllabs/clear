export type SettingsNewCardsOrder = 'after_review' | 'before_review' | 'mixed'

export type Settings = {
  dailyNewLimit: number
  dailyReviewLimit: number
  fsrsParams: number[]
  fsrsRetention: number
  language: string
  masteryHorizonDays: number
  newCardsOrder: SettingsNewCardsOrder
  timezone: string
}
