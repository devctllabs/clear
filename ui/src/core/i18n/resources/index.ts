import { defaultLocale } from '../locales'
import { ar } from './ar'
import { bg } from './bg'
import { bs } from './bs'
import { ca } from './ca'
import { cs } from './cs'
import { da } from './da'
import { de } from './de'
import { el } from './el'
import { enUS } from './en-US'
import { es } from './es'
import { et } from './et'
import { fa } from './fa'
import { fi } from './fi'
import { fr } from './fr'
import { he } from './he'
import { hr } from './hr'
import { hu } from './hu'
import { id } from './id'
import { it } from './it'
import { ja } from './ja'
import { ko } from './ko'
import { lt } from './lt'
import { lv } from './lv'
import { nb } from './nb'
import { nl } from './nl'
import { pl } from './pl'
import { ptBR } from './pt-BR'
import { ro } from './ro'
import { ru } from './ru'
import { sk } from './sk'
import { sl } from './sl'
import { srLatn } from './sr-Latn'
import { sv } from './sv'
import { th } from './th'
import { tr } from './tr'
import { uk } from './uk'
import { vi } from './vi'
import { zhHans } from './zh-Hans'
import { zhHant } from './zh-Hant'

export const defaultNamespace = 'translation'

export const resources = {
  ar: {
    [defaultNamespace]: ar,
  },
  bg: {
    [defaultNamespace]: bg,
  },
  bs: {
    [defaultNamespace]: bs,
  },
  ca: {
    [defaultNamespace]: ca,
  },
  cs: {
    [defaultNamespace]: cs,
  },
  da: {
    [defaultNamespace]: da,
  },
  de: {
    [defaultNamespace]: de,
  },
  el: {
    [defaultNamespace]: el,
  },
  [defaultLocale]: {
    [defaultNamespace]: enUS,
  },
  es: {
    [defaultNamespace]: es,
  },
  et: {
    [defaultNamespace]: et,
  },
  fa: {
    [defaultNamespace]: fa,
  },
  fi: {
    [defaultNamespace]: fi,
  },
  fr: {
    [defaultNamespace]: fr,
  },
  he: {
    [defaultNamespace]: he,
  },
  hr: {
    [defaultNamespace]: hr,
  },
  hu: {
    [defaultNamespace]: hu,
  },
  id: {
    [defaultNamespace]: id,
  },
  it: {
    [defaultNamespace]: it,
  },
  ja: {
    [defaultNamespace]: ja,
  },
  ko: {
    [defaultNamespace]: ko,
  },
  lt: {
    [defaultNamespace]: lt,
  },
  lv: {
    [defaultNamespace]: lv,
  },
  nb: {
    [defaultNamespace]: nb,
  },
  nl: {
    [defaultNamespace]: nl,
  },
  pl: {
    [defaultNamespace]: pl,
  },
  'pt-BR': {
    [defaultNamespace]: ptBR,
  },
  ro: {
    [defaultNamespace]: ro,
  },
  ru: {
    [defaultNamespace]: ru,
  },
  sk: {
    [defaultNamespace]: sk,
  },
  sl: {
    [defaultNamespace]: sl,
  },
  'sr-Latn': {
    [defaultNamespace]: srLatn,
  },
  sv: {
    [defaultNamespace]: sv,
  },
  th: {
    [defaultNamespace]: th,
  },
  tr: {
    [defaultNamespace]: tr,
  },
  uk: {
    [defaultNamespace]: uk,
  },
  vi: {
    [defaultNamespace]: vi,
  },
  'zh-Hans': {
    [defaultNamespace]: zhHans,
  },
  'zh-Hant': {
    [defaultNamespace]: zhHant,
  },
} as const

export type TranslationResources = (typeof resources)[typeof defaultLocale]
