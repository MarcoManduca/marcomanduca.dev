import type { ReactNode } from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { Provider } from 'react-redux'

import { makeStore } from '@/store'
import { API_URL, S3_UPLOAD_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'

import { useMediaUpload } from './useMediaUpload'

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={makeStore()}>{children}</Provider>
)

const makeFile = () => new File(['data'], 'photo.png', { type: 'image/png' })

describe('useMediaUpload', () => {
  it('presigns then uploads the file and exposes the object key', async () => {
    const { result } = renderHook(() => useMediaUpload(), { wrapper })

    await act(async () => {
      await result.current.upload(makeFile(), 'images/projects/')
    })

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.key).toBe('images/projects/uploaded.png')
  })

  it('sends the file size so the presigned URL pins the upload length', async () => {
    let presignBody: unknown
    server.use(
      http.post(`${API_URL}/media/presign`, async ({ request }) => {
        presignBody = await request.json()
        return HttpResponse.json({
          url: S3_UPLOAD_URL,
          key: 'images/projects/uploaded.png',
          expires_in: 900,
        })
      }),
    )
    const { result } = renderHook(() => useMediaUpload(), { wrapper })

    await act(async () => {
      await result.current.upload(makeFile(), 'images/projects/')
    })

    expect(presignBody).toEqual({
      prefix: 'images/projects/',
      filename: 'photo.png',
      content_type: 'image/png',
      content_length: 4,
    })
  })

  it('reports an error when the S3 upload fails', async () => {
    server.use(
      http.put(S3_UPLOAD_URL, () => new HttpResponse(null, { status: 500 })),
    )
    const { result } = renderHook(() => useMediaUpload(), { wrapper })

    await act(async () => {
      await result.current.upload(makeFile(), 'cv/')
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.key).toBeNull()
  })

  it('resets back to the idle state', async () => {
    const { result } = renderHook(() => useMediaUpload(), { wrapper })

    await act(async () => {
      await result.current.upload(makeFile(), 'images/learning/')
    })
    await waitFor(() => expect(result.current.status).toBe('success'))

    act(() => result.current.reset())

    expect(result.current.status).toBe('idle')
    expect(result.current.key).toBeNull()
  })
})
