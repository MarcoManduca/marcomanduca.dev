import { lazy, Suspense } from 'react'

import { AuthProvider } from 'react-oidc-context'
import { Route, Routes } from 'react-router'

import { Spinner } from '@/components/ui/Spinner'
import { userManager } from '@/services/userManager'
import { COGNITO_REDIRECT_URI } from '@/utils/env'
import { isSigninCallback } from '@/utils/isSigninCallback'

import { AuthCallback } from './AuthCallback'
import { ProtectedRoute } from './ProtectedRoute'

// The admin pages (forms, pickers, media uploader) are only reached by the
// owner, so each is split out and loaded on demand.
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

const onSigninCallback = () => {
  // Remove OIDC query params from the URL after the redirect.
  window.history.replaceState({}, document.title, window.location.pathname)
}

/**
 * Everything under /admin, including the auth context. Public pages never
 * need it (they read a stored token directly, see getAccessToken), so the
 * OIDC libraries ship in this chunk rather than in the public bundle.
 */
export const AdminRoutes = () => (
  <AuthProvider
    userManager={userManager}
    onSigninCallback={onSigninCallback}
    // Exchange ?code=&state= only on the callback route. Read once, on mount.
    skipSigninCallback={
      !isSigninCallback(new URL(window.location.href), COGNITO_REDIRECT_URI)
    }
  >
    <Routes>
      <Route path="callback" element={<AuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Suspense fallback={<Spinner className="min-h-screen" />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="learning" element={<AdminLearning />} />
          <Route path="media" element={<AdminMedia />} />
        </Route>
      </Route>
    </Routes>
  </AuthProvider>
)
