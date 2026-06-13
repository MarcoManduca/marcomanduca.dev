import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { Contacts } from './Contacts'

const fillForm = async () => {
  await userEvent.type(screen.getByLabelText('Name'), 'Alice')
  await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com')
  await userEvent.type(screen.getByLabelText('Message'), 'Hello Marco!')
}

describe('Contacts', () => {
  it('shows a success message after a successful submit', async () => {
    renderWithProviders(<Contacts />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Thank you! Your message has been sent.',
    )
  })

  it('shows an error message when the backend fails', async () => {
    server.use(
      http.post(`${API_URL}/contact`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithProviders(<Contacts />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not send the message. Please try again later.',
    )
  })

  it('silently skips the API call when the honeypot field is filled', async () => {
    let apiCalled = false
    server.use(
      http.post(`${API_URL}/contact`, () => {
        apiCalled = true
        return HttpResponse.json({ status: 'sent' }, { status: 201 })
      }),
    )
    renderWithProviders(<Contacts />)

    await fillForm()
    await userEvent.type(screen.getByLabelText('Website'), 'http://spam.bot')
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Thank you! Your message has been sent.',
    )
    expect(apiCalled).toBe(false)
  })
})
