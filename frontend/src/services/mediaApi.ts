import type { PresignRequest, PresignResponse } from '@/types'

import { api } from './api'

export const mediaApi = api.injectEndpoints({
  endpoints: (build) => ({
    presignUpload: build.mutation<PresignResponse, PresignRequest>({
      query: (body) => ({ url: '/media/presign', method: 'POST', body }),
    }),
  }),
})

export const { usePresignUploadMutation } = mediaApi
