import { Outlet } from 'react-router-dom'

import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useLearningOpen } from '@/hooks/useLearningOpen'
import { NotFound } from '@/pages/NotFound'

/** The Learning pages, reachable only once an article is published. */
export const LearningGate = () => {
  const { isOpen, isLoading, isError, refetch } = useLearningOpen()

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return isOpen ? <Outlet /> : <NotFound />
}
