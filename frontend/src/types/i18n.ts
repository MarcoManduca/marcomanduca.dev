/** Supported UI languages. */
export type Language = 'it' | 'en'

/** Bilingual content field as returned by the backend. */
export interface LocalizedText {
  it: string
  en: string
}
