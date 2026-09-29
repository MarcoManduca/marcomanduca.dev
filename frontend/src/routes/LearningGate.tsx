import { Outlet, useMatch } from 'react-router'

import { skipToken } from '@reduxjs/toolkit/query'

import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useLearningOpen } from '@/hooks/useLearningOpen'
import { NotFound } from '@/pages/NotFound'
import { useGetArticleBySlugQuery } from '@/services/learningApi'

/**
 * The Learning pages, reachable only once an article is published. On an
 * article page the article is requested alongside the list, not after the
 * gate opens, so the two round trips overlap.
 */
export const LearningGate = () => {
  const { isOpen, isLoading, isError, refetch } = useLearningOpen()
  const article = useMatch('/learning/:slug')
  useGetArticleBySlugQuery(article?.params.slug ?? skipToken)

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return isOpen ? <Outlet /> : <NotFound />
}
