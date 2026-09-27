import { useState } from 'react'

export type Editing<T> = { mode: 'new' } | { mode: 'edit'; item: T } | null

interface AdminEditorActions<I> {
  /** Each action must reject on failure (e.g. an RTK `.unwrap()` promise). */
  create: (input: I) => Promise<unknown>
  update: (slug: string, input: I) => Promise<unknown>
  remove: (slug: string) => Promise<unknown>
}

/**
 * Create / edit / delete workflow shared by the admin list pages.
 *
 * A failed save keeps the form open and exposes `saveError`; deletion goes
 * through a confirmation step (`pendingDelete`) and exposes `deleteError`.
 * `formKey` changes with the edited item so the form remounts with fresh
 * default values when switching from one item to another.
 */
export const useAdminEditor = <T extends { slug: string }, I>({
  create,
  update,
  remove,
}: AdminEditorActions<I>) => {
  const [editing, setEditing] = useState<Editing<T>>(null)
  const [saveError, setSaveError] = useState<unknown>(null)
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)
  const [deleteError, setDeleteError] = useState<unknown>(null)

  const open = (next: Editing<T>) => {
    setSaveError(null)
    setEditing(next)
  }

  const save = async (input: I) => {
    setSaveError(null)
    try {
      if (editing?.mode === 'edit') await update(editing.item.slug, input)
      else await create(input)
      setEditing(null)
    } catch (error) {
      setSaveError(error)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const { slug } = pendingDelete
    setDeleteError(null)
    try {
      await remove(slug)
      if (editing?.mode === 'edit' && editing.item.slug === slug) open(null)
    } catch (error) {
      setDeleteError(error)
    } finally {
      setPendingDelete(null)
    }
  }

  return {
    editing,
    formKey: editing?.mode === 'edit' ? editing.item.slug : 'new',
    startNew: () => open({ mode: 'new' }),
    startEdit: (item: T) => open({ mode: 'edit', item }),
    cancel: () => open(null),
    save,
    saveError,
    pendingDelete,
    requestDelete: (item: T) => setPendingDelete(item),
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    deleteError,
  }
}
