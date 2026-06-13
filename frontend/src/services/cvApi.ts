import type {
  Cv,
  CvSection,
  CvSectionId,
  CvSectionUpdate,
  Language,
} from '@/types'
import { API_BASE_URL } from '@/utils/env'

import { api } from './api'

/** Backend endpoint generating the CV PDF for the given language. */
export const getCvPdfUrl = (language: Language): string =>
  `${API_BASE_URL}/cv/pdf?lang=${language}`

export const cvApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCv: build.query<Cv, Language>({
      query: (lang) => ({ url: '/cv', params: { lang } }),
      providesTags: ['Cv'],
    }),
    updateCvSection: build.mutation<
      CvSection,
      { section: CvSectionId; body: CvSectionUpdate }
    >({
      query: ({ section, body }) => ({
        url: `/cv/${section}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cv'],
    }),
  }),
})

export const { useGetCvQuery, useUpdateCvSectionMutation } = cvApi
