import { useGetArticlesQuery } from '@/services/learningApi'

/**
 * Whether the Learning section is open: only once an article is published.
 * Admins also get drafts from the API, and those do not count. While the
 * list loads, or when it fails, the section stays closed.
 */
export const useLearningOpen = () => {
  const { data, isLoading, isError, refetch } = useGetArticlesQuery()
  const isOpen = (data ?? []).some(({ status }) => status === 'published')

  return { isOpen, isLoading, isError, refetch }
}
