import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { CvSectionForm } from './CvSectionForm'

describe('CvSectionForm', () => {
  it('prefills strings as-is and structured content as JSON', () => {
    renderWithProviders(
      <CvSectionForm
        section="summary"
        content={{ it: 'Ciao', en: ['a', 'b'] }}
      />,
    )

    expect(screen.getByLabelText('Content (IT, JSON)')).toHaveValue('Ciao')
    expect(screen.getByLabelText('Content (EN, JSON)')).toHaveValue(
      JSON.stringify(['a', 'b'], null, 2),
    )
  })

  it('sends parsed bilingual content on save', async () => {
    let received: unknown
    server.use(
      http.put(`${API_URL}/cv/:section`, async ({ request, params }) => {
        received = await request.json()
        return HttpResponse.json({
          section: params.section,
          content: (received as { content: unknown }).content,
        })
      }),
    )

    renderWithProviders(
      <CvSectionForm section="summary" content={{ it: '', en: '' }} />,
    )

    await userEvent.type(
      screen.getByLabelText('Content (IT, JSON)'),
      'Sommario',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(received).toMatchObject({ content: { it: 'Sommario', en: '' } })
  })
})
