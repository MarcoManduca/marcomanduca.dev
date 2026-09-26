import { lazy, Suspense } from 'react'

import { Route, Routes } from 'react-router-dom'

import { PublicLayout } from '@/components/layout/PublicLayout'
import { Spinner } from '@/components/ui/Spinner'
import { AboutMe } from '@/pages/AboutMe'
import { Contacts } from '@/pages/Contacts'
import { Home } from '@/pages/Home'
import { Learning } from '@/pages/Learning'
import { NotFound } from '@/pages/NotFound'
import { Projects } from '@/pages/Projects'

import { AuthCallback } from './AuthCallback'
import { ProtectedRoute } from './ProtectedRoute'

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

// The admin area (forms, pickers, media uploader) is only reached by the
// owner, so it is code-split out of the public bundle and loaded on demand.
const AdminLayout = lazy(() =>
  import('@/components/layout/AdminLayout').then((m) => ({
    default: m.AdminLayout,
  })),
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  })),
)
const AdminProjects = lazy(() =>
  import('@/pages/admin/AdminProjects').then((m) => ({
    default: m.AdminProjects,
  })),
)
const AdminLearning = lazy(() =>
  import('@/pages/admin/AdminLearning').then((m) => ({
    default: m.AdminLearning,
  })),
)
const AdminMedia = lazy(() =>
  import('@/pages/admin/AdminMedia').then((m) => ({ default: m.AdminMedia })),
)

export const AppRoutes = () => (
  <Routes>
    <Route path="/admin/callback" element={<AuthCallback />} />
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about-me" element={<AboutMe />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/learning" element={<Learning />} />
      <Route path="/learning/:slug" element={<LearningDetail />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route
        element={
          <Suspense fallback={<Spinner className="min-h-screen" />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/learning" element={<AdminLearning />} />
        <Route path="/admin/media" element={<AdminMedia />} />
      </Route>
    </Route>
  </Routes>
)
