import { screen, waitFor } from '@testing-library/react'
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
  await userEvent.click(screen.getByRole('checkbox'))
}

describe('Contacts', () => {
  it('keeps submit disabled until the privacy consent is given', async () => {
    renderWithProviders(<Contacts />)

    const submit = screen.getByRole('button', { name: 'Send message' })
    expect(submit).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox'))
    expect(submit).toBeEnabled()
  })

  it('shows a success message after a successful submit', async () => {
    const { store } = renderWithProviders(<Contacts />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Thank you! Your message has been sent.',
    )
    expect(store.getState().game.unlocked).toContain('contact')
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

  it.each([
    [422, 'Please check the fields'],
    [429, 'Too many messages in a short time'],
  ])('explains a %i rejection', async (status, message) => {
    server.use(
      http.post(`${API_URL}/contact`, () =>
        HttpResponse.json({ detail: 'rejected' }, { status }),
      ),
    )
    renderWithProviders(<Contacts />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })

  it('limits the fields to what the backend accepts', () => {
    renderWithProviders(<Contacts />)

    expect(screen.getByLabelText('Name')).toHaveAttribute('maxlength', '120')
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'autocomplete',
      'email',
    )
    expect(screen.getByLabelText('Message')).toHaveAttribute(
      'maxlength',
      '5000',
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

describe('Contacts title', () => {
  it('names the page in the document title', async () => {
    renderWithProviders(<Contacts />)

    await waitFor(() =>
      expect(document.title).toBe('Contacts — marcomanduca.dev'),
    )
  })
})
