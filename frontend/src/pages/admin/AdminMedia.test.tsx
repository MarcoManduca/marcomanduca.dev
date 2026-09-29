import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL, S3_UPLOAD_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { AdminMedia } from './AdminMedia'

const uploadFile = async () => {
  const file = new File(['data'], 'photo.png', { type: 'image/png' })
  await userEvent.upload(screen.getByLabelText('File'), file)
  await userEvent.click(screen.getByRole('button', { name: 'Upload' }))
}

describe('AdminMedia', () => {
  it('uploads an image and shows the path to use in content', async () => {
    renderWithProviders(<AdminMedia />)

    await uploadFile()

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Public path: /media/images/projects/uploaded.png',
    )
  })

  it('copies the public path of an uploaded image', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminMedia />)
    await uploadFile()
    await screen.findByRole('status')

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(await navigator.clipboard.readText()).toBe(
      '/media/images/projects/uploaded.png',
    )
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('shows the object key of the private CV', async () => {
    server.use(
      http.post(`${API_URL}/media/presign`, () =>
        HttpResponse.json({
          url: S3_UPLOAD_URL,
          key: 'cv/cv.pdf',
          expires_in: 900,
          public_path: null,
        }),
      ),
    )
    renderWithProviders(<AdminMedia />)
    await userEvent.selectOptions(
      screen.getByLabelText('Destination folder'),
      'cv/',
    )

    await userEvent.upload(
      screen.getByLabelText('File'),
      new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Upload' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Object key: cv/cv.pdf',
    )
  })

  it('clears the previous result when another file is picked', async () => {
    renderWithProviders(<AdminMedia />)
    await uploadFile()
    await screen.findByRole('status')

    await userEvent.upload(
      screen.getByLabelText('File'),
      new File(['more'], 'other.png', { type: 'image/png' }),
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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
