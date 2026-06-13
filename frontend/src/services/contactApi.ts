import type { ContactPayload, ContactResponse } from '@/types'

import { api } from './api'

export const contactApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendContact: build.mutation<ContactResponse, ContactPayload>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
  }),
})

export const { useSendContactMutation } = contactApi
