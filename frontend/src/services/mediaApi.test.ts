import { makeStore } from '@/store'

import { mediaApi } from './mediaApi'

describe('mediaApi', () => {
  it('requests a presigned upload URL and returns the target key', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      mediaApi.endpoints.presignUpload.initiate({
        prefix: 'images/projects/',
        filename: 'photo.png',
        content_type: 'image/png',
      }),
    )

    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data?.url).toBe('http://localhost/s3-upload')
      expect(result.data?.key).toBe('images/projects/uploaded.png')
      expect(result.data?.expires_in).toBe(900)
    }
  })
})
