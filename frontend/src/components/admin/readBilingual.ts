import type { LocalizedText } from '@/types'

/** Read the `<name>It` / `<name>En` pair rendered by `BilingualFields`. */
export const readBilingual = (data: FormData, name: string): LocalizedText => ({
  it: String(data.get(`${name}It`) ?? ''),
  en: String(data.get(`${name}En`) ?? ''),
})
