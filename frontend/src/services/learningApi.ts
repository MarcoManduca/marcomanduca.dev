import type {
  ArticleVersion,
  LearningArticle,
  LearningArticleInput,
  LearningQuery,
} from '@/types'

import { api } from './api'

export const learningApi = api.injectEndpoints({
  endpoints: (build) => ({
    getArticles: build.query<LearningArticle[], LearningQuery | void>({
      query: (params) => ({ url: '/learning', params: params ?? undefined }),
      providesTags: ['Article'],
    }),
    getArticleBySlug: build.query<LearningArticle, string>({
      query: (slug) => `/learning/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Article', id: slug }],
    }),
    createArticle: build.mutation<LearningArticle, LearningArticleInput>({
      query: (body) => ({ url: '/learning', method: 'POST', body }),
      invalidatesTags: ['Article'],
    }),
    updateArticle: build.mutation<
      LearningArticle,
      { slug: string; body: LearningArticleInput }
    >({
      query: ({ slug, body }) => ({
        url: `/learning/${slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Article', 'ArticleVersions'],
    }),
    deleteArticle: build.mutation<void, string>({
      query: (slug) => ({ url: `/learning/${slug}`, method: 'DELETE' }),
      invalidatesTags: ['Article'],
    }),
    getArticleVersions: build.query<ArticleVersion[], string>({
      query: (slug) => `/learning/${slug}/versions`,
      providesTags: ['ArticleVersions'],
    }),
    rollbackArticle: build.mutation<
      LearningArticle,
      { slug: string; version: number }
    >({
      query: ({ slug, version }) => ({
        url: `/learning/${slug}/rollback`,
        method: 'POST',
        body: { version },
      }),
      invalidatesTags: ['Article', 'ArticleVersions'],
    }),
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetArticleVersionsQuery,
  useRollbackArticleMutation,
} = learningApi
