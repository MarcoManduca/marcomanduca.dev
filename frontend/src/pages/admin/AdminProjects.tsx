import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable } from '@/components/admin/AdminTable'
import { EditorPanel } from '@/components/admin/EditorPanel'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '@/services/projectsApi'
import type { Project, ProjectInput } from '@/types'

import { DeleteConfirm } from './DeleteConfirm'
import { ProjectForm } from './ProjectForm'
import { ProjectRow } from './ProjectRow'
import { useAdminEditor } from './useAdminEditor'

export const AdminProjects = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading } = useGetProjectsQuery()
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation()
  const editor = useAdminEditor<Project, ProjectInput>({
    create: (body) => createProject(body).unwrap(),
    update: (slug, body) => updateProject({ slug, body }).unwrap(),
    remove: (slug) => deleteProject(slug).unwrap(),
  })
  const { editing, pendingDelete } = editor

  if (isLoading) return <Spinner />

  return (
    <>
      <AdminPageHeader
        title={t('admin.projects.title')}
        actionLabel={t('admin.projects.newProject')}
        onAction={editor.startNew}
      />
      {editing && (
        <EditorPanel
          title={t(
            editing.mode === 'edit'
              ? 'admin.projects.editProject'
              : 'admin.projects.newProject',
          )}
          error={editor.saveError}
        >
          <ProjectForm
            key={editor.formKey}
            initial={editing.mode === 'edit' ? editing.item : null}
            isSaving={isCreating || isUpdating}
            onSubmit={editor.save}
            onCancel={editor.cancel}
          />
        </EditorPanel>
      )}
      <AdminErrorAlert
        title={t('admin.errors.deleteFailed')}
        error={editor.deleteError}
        className="mt-6"
      />
      <AdminTable columns={['title', 'category', 'status']}>
        {data?.map((project) => (
          <ProjectRow
            key={project.slug}
            project={project}
            onEdit={() => editor.startEdit(project)}
            onDelete={() => editor.requestDelete(project)}
          />
        ))}
      </AdminTable>
      <DeleteConfirm
        title={pendingDelete && localize(pendingDelete.title)}
        isPending={isDeleting}
        onConfirm={() => void editor.confirmDelete()}
        onCancel={editor.cancelDelete}
      />
    </>
  )
}
