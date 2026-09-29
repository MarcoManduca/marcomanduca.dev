import { lazy, Suspense } from 'react'

import { Route, Routes } from 'react-router'

import { PublicLayout } from '@/components/layout/PublicLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { AboutMe } from '@/pages/AboutMe'
import { Contacts } from '@/pages/Contacts'
import { Home } from '@/pages/Home'
import { Learning } from '@/pages/Learning'
import { NotFound } from '@/pages/NotFound'
import { Projects } from '@/pages/Projects'

import { LearningGate } from './LearningGate'

// Public detail pages pull in the markdown renderer and are rarely the entry
// point, so they are split out too. PublicLayout wraps its outlet in a
// Suspense boundary with a Spinner fallback.
const ProjectDetail = lazy(() =>
  import('@/pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
)
const LearningDetail = lazy(() =>
  import('@/pages/LearningDetail').then((m) => ({
    default: m.LearningDetail,
  })),
)
const PrivacyPolicy = lazy(() =>
  import('@/pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
)

// The admin area, with its auth context and the OIDC libraries, is only
// reached by the owner: it is code-split out of the public bundle.
const AdminRoutes = lazy(() =>
  import('./AdminRoutes').then((m) => ({ default: m.AdminRoutes })),
)

// Pages sit behind their layout's error boundary; this outer one is the last
// resort for the layouts themselves (e.g. the admin chunk failing to load).
export const AppRoutes = () => (
  <ErrorBoundary>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-me" element={<AboutMe />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route element={<LearningGate />}>
          <Route path="/learning" element={<Learning />} />
          <Route path="/learning/:slug" element={<LearningDetail />} />
        </Route>
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Spinner className="min-h-screen" />}>
            <AdminRoutes />
          </Suspense>
        }
      />
    </Routes>
  </ErrorBoundary>
)
