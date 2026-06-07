import { describe, expect, it } from 'vitest'

import {
  createAppI18n,
  defaultLocale,
  defaultNamespace,
  getDocumentLocale,
  getLocaleDirection,
  publicLocales,
  resources,
} from '@core/i18n'

type FlatResource = Record<string, string>

const flattenResource = (
  value: unknown,
  prefix = '',
  result: FlatResource = {},
): FlatResource => {
  if (typeof value === 'string') {
    result[prefix] = value
    return result
  }

  if (!value || typeof value !== 'object') {
    return result
  }

  for (const [key, child] of Object.entries(value)) {
    flattenResource(child, prefix ? `${prefix}.${key}` : key, result)
  }

  return result
}

const placeholdersFor = (value: string) =>
  [...value.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]).sort()

describe('i18n', () => {
  it('creates an English i18next instance with typed selector resources', () => {
    const i18n = createAppI18n()

    expect(i18n.language).toBe(defaultLocale)
    expect(i18n.t(($) => $.decks.labels.due)).toBe('Due')
    expect(i18n.t(($) => $.decks.actions.openDeck, { title: 'Biology' })).toBe(
      'Open Biology deck',
    )
  })

  it('falls back to English for unsupported locales', () => {
    const i18n = createAppI18n('zz')

    expect(i18n.t(($) => $.decks.labels.dueToday)).toBe('Due Today')
  })

  it('maps public locales to document metadata', () => {
    expect(getDocumentLocale('ar')).toBe('ar')
    expect(getDocumentLocale('zz')).toBe(defaultLocale)
    expect(getLocaleDirection('fa')).toBe('rtl')
    expect(getLocaleDirection('ar')).toBe('rtl')
    expect(getLocaleDirection('he')).toBe('rtl')
    expect(getLocaleDirection(defaultLocale)).toBe('ltr')
    expect(getLocaleDirection('zz')).toBe('ltr')
  })

  it('loads each public locale through i18next resources', () => {
    expect(publicLocales).toEqual([
      'en-US',
      'es',
      'pt-BR',
      'fr',
      'de',
      'ja',
      'zh-Hans',
      'zh-Hant',
      'ko',
      'id',
      'ru',
      'it',
      'nl',
      'tr',
      'pl',
      'vi',
      'cs',
      'uk',
      'hu',
      'sv',
      'ro',
      'el',
      'da',
      'fi',
      'sk',
      'bg',
      'th',
      'hr',
      'nb',
      'sr-Latn',
      'lt',
      'sl',
      'ca',
      'et',
      'lv',
      'bs',
      'fa',
      'ar',
      'he',
    ])

    expect(createAppI18n('es').t(($) => $.settings.labels.settings)).toBe('Ajustes')
    expect(createAppI18n('pt-BR').t(($) => $.settings.labels.settings)).toBe(
      'Configurações',
    )
    expect(createAppI18n('fr').t(($) => $.settings.labels.settings)).toBe('Paramètres')
    expect(createAppI18n('de').t(($) => $.settings.labels.settings)).toBe('Einstellungen')
    expect(createAppI18n('ja').t(($) => $.settings.labels.settings)).toBe('設定')
    expect(createAppI18n('zh-Hans').t(($) => $.settings.labels.settings)).toBe('设置')
    expect(createAppI18n('zh-Hant').t(($) => $.settings.labels.settings)).toBe('設定')
    expect(createAppI18n('ko').t(($) => $.settings.labels.settings)).toBe('설정')
    expect(createAppI18n('id').t(($) => $.settings.labels.settings)).toBe('Pengaturan')
    expect(createAppI18n('ru').t(($) => $.settings.labels.settings)).toBe('Настройки')
    expect(createAppI18n('it').t(($) => $.settings.labels.settings)).toBe('Impostazioni')
    expect(createAppI18n('nl').t(($) => $.settings.labels.settings)).toBe('Instellingen')
    expect(createAppI18n('tr').t(($) => $.settings.labels.settings)).toBe('Ayarlar')
    expect(createAppI18n('pl').t(($) => $.settings.labels.settings)).toBe('Ustawienia')
    expect(createAppI18n('vi').t(($) => $.settings.labels.settings)).toBe('Cài đặt')
    expect(createAppI18n('cs').t(($) => $.settings.labels.settings)).toBe('Nastavení')
    expect(createAppI18n('uk').t(($) => $.settings.labels.settings)).toBe(
      'Налаштування',
    )
    expect(createAppI18n('hu').t(($) => $.settings.labels.settings)).toBe('Beállítások')
    expect(createAppI18n('sv').t(($) => $.settings.labels.settings)).toBe('Inställningar')
    expect(createAppI18n('ro').t(($) => $.settings.labels.settings)).toBe('Setări')
    expect(createAppI18n('el').t(($) => $.settings.labels.settings)).toBe('Ρυθμίσεις')
    expect(createAppI18n('da').t(($) => $.settings.labels.settings)).toBe(
      'Indstillinger',
    )
    expect(createAppI18n('fi').t(($) => $.settings.labels.settings)).toBe('Asetukset')
    expect(createAppI18n('sk').t(($) => $.settings.labels.settings)).toBe('Nastavenia')
    expect(createAppI18n('bg').t(($) => $.settings.labels.settings)).toBe('Настройки')
    expect(createAppI18n('th').t(($) => $.settings.labels.settings)).toBe('การตั้งค่า')
    expect(createAppI18n('hr').t(($) => $.settings.labels.settings)).toBe('Postavke')
    expect(createAppI18n('nb').t(($) => $.settings.labels.settings)).toBe(
      'Innstillinger',
    )
    expect(createAppI18n('sr-Latn').t(($) => $.settings.labels.settings)).toBe(
      'Podešavanja',
    )
    expect(createAppI18n('lt').t(($) => $.settings.labels.settings)).toBe('Nustatymai')
    expect(createAppI18n('sl').t(($) => $.settings.labels.settings)).toBe('Nastavitve')
    expect(createAppI18n('ca').t(($) => $.settings.labels.settings)).toBe(
      'Configuració',
    )
    expect(createAppI18n('et').t(($) => $.settings.labels.settings)).toBe('Seaded')
    expect(createAppI18n('lv').t(($) => $.settings.labels.settings)).toBe('Iestatījumi')
    expect(createAppI18n('bs').t(($) => $.settings.labels.settings)).toBe('Postavke')
    expect(createAppI18n('fa').t(($) => $.settings.labels.settings)).toBe('تنظیمات')
    expect(createAppI18n('ar').t(($) => $.settings.labels.settings)).toBe('الإعدادات')
    expect(createAppI18n('he').t(($) => $.settings.labels.settings)).toBe('הגדרות')
  })

  it('keeps locale resource keys and placeholders aligned with English', () => {
    const defaultResource = flattenResource(resources[defaultLocale][defaultNamespace])
    const defaultKeys = Object.keys(defaultResource).sort()

    for (const locale of publicLocales) {
      const localeResource = flattenResource(resources[locale][defaultNamespace])
      const missingKeys = defaultKeys.filter((key) => !(key in localeResource))
      const placeholderMismatches = defaultKeys.filter(
        (key) =>
          JSON.stringify(placeholdersFor(localeResource[key] ?? '')) !==
          JSON.stringify(placeholdersFor(defaultResource[key])),
      )

      expect(missingKeys, locale).toEqual([])
      expect(placeholderMismatches, locale).toEqual([])
    }
  })

  it('uses Russian plural categories for count-based translations', () => {
    const i18n = createAppI18n('ru')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 элемент')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 элемента')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 элементов')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 21 })).toBe('21 день назад')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 22 })).toBe('22 дня назад')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 25 })).toBe('25 дней назад')
  })

  it('uses Polish plural categories for count-based translations', () => {
    const i18n = createAppI18n('pl')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 element')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 elementy')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 elementów')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('1 dzień temu')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('2 dni temu')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('5 dni temu')
  })

  it('uses Czech plural categories for count-based translations', () => {
    const i18n = createAppI18n('cs')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 položka')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 položky')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 položek')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('před 1 dnem')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('před 2 dny')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('před 5 dny')
  })

  it('uses Croatian plural categories for count-based translations', () => {
    const i18n = createAppI18n('hr')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 stavka')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 stavke')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 stavki')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('prije 1 dan')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('prije 2 dana')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('prije 5 dana')
  })

  it('uses Slovenian plural categories for count-based translations', () => {
    const i18n = createAppI18n('sl')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 element')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 elementa')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 3 })).toBe('3 elementi')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 elementov')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('pred 1 dnem')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('pred 2 dnevoma')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 3 })).toBe('pred 3 dnevi')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('pred 5 dnevi')
  })

  it('uses Bosnian plural categories for count-based translations', () => {
    const i18n = createAppI18n('bs')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 stavka')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 stavke')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 stavki')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('prije 1 dan')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('prije 2 dana')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('prije 5 dana')
  })

  it('uses Arabic plural categories for count-based translations', () => {
    const i18n = createAppI18n('ar')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 0 })).toBe('0 عنصر')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 عنصر')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 عنصران')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 3 })).toBe('3 عناصر')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 11 })).toBe('11 عنصرا')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 100 })).toBe('100 عنصر')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 0 })).toBe('منذ 0 يوم')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('منذ 1 يوم')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('منذ 2 يومين')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 3 })).toBe('منذ 3 أيام')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 11 })).toBe('منذ 11 يوما')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 100 })).toBe('منذ 100 يوم')
  })

  it('uses Hebrew plural categories for count-based translations', () => {
    const i18n = createAppI18n('he')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 פריט')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 פריטים')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 3 })).toBe('3 פריטים')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('לפני 1 יום')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('לפני 2 ימים')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 3 })).toBe('לפני 3 ימים')
  })

  it('uses Ukrainian plural categories for count-based translations', () => {
    const i18n = createAppI18n('uk')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 елемент')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 елементи')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 елементів')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 21 })).toBe('21 день тому')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 22 })).toBe('22 дні тому')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 25 })).toBe('25 днів тому')
  })

  it('uses Slovak plural categories for count-based translations', () => {
    const i18n = createAppI18n('sk')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 položka')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 položky')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 položiek')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('pred 1 dňom')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('pred 2 dňami')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('pred 5 dňami')
  })

  it('uses Serbian Latin plural categories for count-based translations', () => {
    const i18n = createAppI18n('sr-Latn')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 stavka')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 stavke')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 5 })).toBe('5 stavki')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('pre 1 dan')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('pre 2 dana')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 5 })).toBe('pre 5 dana')
  })

  it('uses Lithuanian plural categories for count-based translations', () => {
    const i18n = createAppI18n('lt')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 elementas')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 elementai')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 10 })).toBe('10 elementų')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('prieš 1 dieną')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('prieš 2 dienas')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 10 })).toBe('prieš 10 dienų')
  })

  it('uses Latvian plural categories for count-based translations', () => {
    const i18n = createAppI18n('lv')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 0 })).toBe('0 vienumu')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 vienums')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 vienumi')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 0 })).toBe('pirms 0 dienām')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('pirms 1 dienas')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('pirms 2 dienām')
  })

  it('uses Romanian plural categories for count-based translations', () => {
    const i18n = createAppI18n('ro')

    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 1 })).toBe('1 element')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 2 })).toBe('2 elemente')
    expect(i18n.t(($) => $.trash.labels.itemCount, { count: 21 })).toBe(
      '21 de elemente',
    )
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 1 })).toBe('acum 1 zi')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 2 })).toBe('acum 2 zile')
    expect(i18n.t(($) => $.dates.age.dayAgo, { count: 21 })).toBe(
      'acum 21 de zile',
    )
  })
})
