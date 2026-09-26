import type { Project, ProjectInput, ProjectQuery } from '@/types'

import { api } from './api'

export const projectsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], ProjectQuery | void>({
      query: (params) => ({ url: '/projects', params: params ?? undefined }),
      providesTags: ['Project'],
    }),
    getProjectBySlug: build.query<Project, string>({
      query: (slug) => `/projects/${encodeURIComponent(slug)}`,
      providesTags: (_result, _error, slug) => [{ type: 'Project', id: slug }],
    }),
    createProject: build.mutation<Project, ProjectInput>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateProject: build.mutation<
      Project,
      { slug: string; body: ProjectInput }
    >({
      query: ({ slug, body }) => ({
        url: `/projects/${encodeURIComponent(slug)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: build.mutation<void, string>({
      query: (slug) => ({
        url: `/projects/${encodeURIComponent(slug)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useGetProjectBySlugQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi
