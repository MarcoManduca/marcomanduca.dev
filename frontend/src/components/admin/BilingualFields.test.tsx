import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { BilingualFields } from './BilingualFields'
import { readBilingual } from './readBilingual'

describe('BilingualFields', () => {
  it('renders labelled IT/EN inputs prefilled with the localized value', () => {
    renderWithProviders(
      <BilingualFields
        name="title"
        defaultValue={{ it: 'Titolo', en: 'Title' }}
        required
      />,
    )

    expect(screen.getByLabelText('Title (IT)')).toHaveValue('Titolo')
    expect(screen.getByLabelText('Title (EN)')).toHaveValue('Title')
    expect(screen.getByLabelText('Title (EN)')).toBeRequired()
  })

  it('renders textareas when rows are given', () => {
    renderWithProviders(<BilingualFields name="content" rows={4} />)

    expect(
      screen.getByRole('textbox', { name: 'Content (IT, markdown)' }).tagName,
    ).toBe('TEXTAREA')
  })

  it('reads the pair back from the form data', () => {
    const { container } = renderWithProviders(
      <form>
        <BilingualFields
          name="description"
          defaultValue={{ it: 'Descrizione', en: 'Description' }}
        />
      </form>,
    )
    const form = container.querySelector('form') as HTMLFormElement

    expect(readBilingual(new FormData(form), 'description')).toEqual({
      it: 'Descrizione',
      en: 'Description',
    })
  })
})
