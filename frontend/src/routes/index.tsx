import { Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AboutMe } from '@/pages/AboutMe'
import { AdminCv } from '@/pages/admin/AdminCv'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminLearning } from '@/pages/admin/AdminLearning'
import { AdminMedia } from '@/pages/admin/AdminMedia'
import { AdminProjects } from '@/pages/admin/AdminProjects'
import { Contacts } from '@/pages/Contacts'
import { Cv } from '@/pages/Cv'
import { Home } from '@/pages/Home'
import { Learning } from '@/pages/Learning'
import { LearningDetail } from '@/pages/LearningDetail'
import { NotFound } from '@/pages/NotFound'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Projects } from '@/pages/Projects'

import { ProtectedRoute } from './ProtectedRoute'

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about-me" element={<AboutMe />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/learning" element={<Learning />} />
      <Route path="/learning/:slug" element={<LearningDetail />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/cv" element={<Cv />} />
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/learning" element={<AdminLearning />} />
        <Route path="/admin/media" element={<AdminMedia />} />
        <Route path="/admin/cv" element={<AdminCv />} />
      </Route>
    </Route>
  </Routes>
)
