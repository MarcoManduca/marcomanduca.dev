import type { PresignRequest, PresignResponse } from '@/types'

import { api } from './api'

export const mediaApi = api.injectEndpoints({
  endpoints: (build) => ({
    presignUpload: build.mutation<PresignResponse, PresignRequest>({
      query: (body) => ({ url: '/media/presign', method: 'POST', body }),
    }),
    getMediaUrl: build.query<PresignResponse, string>({
      query: (key) => ({ url: '/media/url', params: { key } }),
    }),
  }),
})

export const { usePresignUploadMutation, useLazyGetMediaUrlQuery } = mediaApi
