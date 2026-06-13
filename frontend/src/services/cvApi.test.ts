import { makeStore } from '@/store'

import { cvApi, getCvPdfUrl } from './cvApi'

describe('cvApi', () => {
  it('builds the localized PDF download URL', () => {
    expect(getCvPdfUrl('it')).toContain('/cv/pdf?lang=it')
    expect(getCvPdfUrl('en')).toContain('/cv/pdf?lang=en')
  })

  it('fetches the CV localized to the requested language', async () => {
    const store = makeStore()

    const result = await store.dispatch(cvApi.endpoints.getCv.initiate('it'))

    expect(result.status).toBe('fulfilled')
    expect(result.data?.lang).toBe('it')
    expect(result.data?.sections.summary).toContain('Ingegnere')
  })

  it('updates a CV section with bilingual content', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      cvApi.endpoints.updateCvSection.initiate({
        section: 'summary',
        body: { content: { it: 'IT', en: 'EN' } },
      }),
    )

    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data?.section).toBe('summary')
      expect(result.data?.content).toEqual({ it: 'IT', en: 'EN' })
    }
  })
})
