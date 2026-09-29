import { useState } from 'react'

import {
  useCreateTechnologyMutation,
  useGetTechnologiesQuery,
} from '@/services/technologiesApi'

/**
 * The typed name of a technology to add, and the action adding it: an
 * existing technology is matched case-insensitively, a new one is created in
 * the catalogue first. `onAdded` receives the catalogue name. A failure is
 * exposed as `error` and keeps the typed name, so it can be retried.
 */
export const useAddTechnology = (onAdded: (name: string) => void) => {
  const { data: technologies = [] } = useGetTechnologiesQuery()
  const [createTechnology, { isLoading }] = useCreateTechnologyMutation()
  const [name, setName] = useState('')
  const [error, setError] = useState<unknown>(null)

  const resolveName = async (typed: string): Promise<string> => {
    const existing = technologies.find(
      (tech) => tech.name.toLowerCase() === typed.toLowerCase(),
    )
    if (existing) return existing.name
    const created = await createTechnology({
      name: typed,
      icon: typed.toLowerCase(),
      category: 'other',
    }).unwrap()
    return created.name
  }

  const add = async () => {
    const typed = name.trim()
    if (!typed) return
    setError(null)
    try {
      onAdded(await resolveName(typed))
      setName('')
    } catch (caught) {
      setError(caught)
    }
  }

  return { technologies, name, setName, add, isAdding: isLoading, error }
}
