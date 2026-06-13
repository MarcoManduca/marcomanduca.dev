import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '@/services/projectsApi'
import type { Project, ProjectInput } from '@/types'

import { ProjectForm } from './ProjectForm'

type Editing = { mode: 'new' } | { mode: 'edit'; project: Project } | null

export const AdminProjects = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading } = useGetProjectsQuery()
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()
  const [editing, setEditing] = useState<Editing>(null)

  const handleSubmit = async (input: ProjectInput) => {
    if (editing?.mode === 'edit') {
      await updateProject({ slug: editing.project.slug, body: input })
    } else {
      await createProject(input)
    }
    setEditing(null)
  }

  if (isLoading) return <Spinner />

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">
          {t('admin.projects.title')}
        </h1>
        <Button onClick={() => setEditing({ mode: 'new' })}>
          {t('admin.projects.newProject')}
        </Button>
      </div>
      {editing && (
        <div className="mt-6 rounded-xl border border-edge bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-heading">
            {editing.mode === 'edit'
              ? t('admin.projects.editProject')
              : t('admin.projects.newProject')}
          </h2>
          <ProjectForm
            initial={editing.mode === 'edit' ? editing.project : null}
            isSaving={isCreating || isUpdating}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b border-edge text-muted">
          <tr>
            <th className="py-2 pr-4">{t('admin.table.title')}</th>
            <th className="py-2 pr-4">{t('admin.table.category')}</th>
            <th className="py-2 pr-4">{t('admin.table.status')}</th>
            <th className="py-2">{t('admin.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((project) => (
            <tr key={project.slug} className="border-b border-edge/50">
              <td className="py-3 pr-4 font-medium text-heading">
                {localize(project.title)}
              </td>
              <td className="py-3 pr-4">
                {t(`projectCategories.${project.category}`)}
              </td>
              <td className="py-3 pr-4">
                <Badge tone={project.status === 'published' ? 'green' : 'gray'}>
                  {t(`statuses.${project.status}`)}
                </Badge>
              </td>
              <td className="flex gap-2 py-3">
                <Button
                  variant="secondary"
                  onClick={() => setEditing({ mode: 'edit', project })}
                >
                  {t('admin.actions.edit')}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void deleteProject(project.slug)}
                >
                  {t('admin.actions.delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
