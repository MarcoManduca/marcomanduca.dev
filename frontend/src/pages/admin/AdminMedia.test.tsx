import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { S3_UPLOAD_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { AdminMedia } from './AdminMedia'

const uploadFile = async () => {
  const file = new File(['data'], 'photo.png', { type: 'image/png' })
  await userEvent.upload(screen.getByLabelText('File'), file)
  await userEvent.click(screen.getByRole('button', { name: 'Upload' }))
}

describe('AdminMedia', () => {
  it('uploads a file and shows the resulting object key', async () => {
    renderWithProviders(<AdminMedia />)

    await uploadFile()

    expect(await screen.findByRole('status')).toHaveTextContent(
      'images/projects/uploaded.png',
    )
  })

  it('shows an error message when the upload fails', async () => {
    server.use(
      http.put(S3_UPLOAD_URL, () => new HttpResponse(null, { status: 500 })),
    )
    renderWithProviders(<AdminMedia />)

    await uploadFile()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Upload failed. Please try again.',
    )
  })
})
