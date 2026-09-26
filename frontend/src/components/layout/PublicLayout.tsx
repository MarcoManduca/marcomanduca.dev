import { Suspense } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'

import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollToTop } from './ScrollToTop'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'

export const PublicLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SkipLink />
      <Header />
      {/* Keyed by route so the entrance animation replays on navigation. */}
      <main
        key={pathname}
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 focus:outline-none motion-safe:animate-fade-in-up"
      >
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
