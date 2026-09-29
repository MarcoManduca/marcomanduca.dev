import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable } from '@/components/admin/AdminTable'
import { EditorPanel } from '@/components/admin/EditorPanel'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '@/services/projectsApi'
import type { ProjectInput, ProjectSummary } from '@/types'

import { DeleteConfirm } from './DeleteConfirm'
import { ProjectForm } from './ProjectForm'
import { ProjectFormLoader } from './ProjectFormLoader'
import { ProjectRow } from './ProjectRow'
import { useAdminEditor } from './useAdminEditor'

export const AdminProjects = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading, isError, refetch } = useGetProjectsQuery()
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation()
  const editor = useAdminEditor<ProjectSummary, ProjectInput>({
    create: (body) => createProject(body).unwrap(),
    update: (slug, body) => updateProject({ slug, body }).unwrap(),
    remove: (slug) => deleteProject(slug).unwrap(),
  })
  const { editing, pendingDelete } = editor
  const formProps = {
    isSaving: isCreating || isUpdating,
    onSubmit: editor.save,
    onCancel: editor.cancel,
    onDirty: editor.markDirty,
  }

  if (isLoading) return <Spinner />
  // Only without data: a failed refetch after a save keeps the open editor.
  if (isError && !data) return <ErrorState onRetry={() => void refetch()} />

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
          {editing.mode === 'edit' ? (
            <ProjectFormLoader
              key={editor.formKey}
              slug={editing.item.slug}
              {...formProps}
            />
          ) : (
            <ProjectForm key={editor.formKey} initial={null} {...formProps} />
          )}
        </EditorPanel>
      )}
      <AdminErrorAlert
        title={t('admin.errors.deleteFailed')}
        error={editor.deleteError}
        className="mt-6"
      />
      <AdminTable columns={['title', 'areas', 'status']}>
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
