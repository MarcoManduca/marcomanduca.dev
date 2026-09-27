import type { Technology } from '@/types'

/** Category of the technologies the registry does not know. */
export const OTHER_CATEGORY = 'other'

export interface TechnologyGroup {
  category: string
  names: string[]
}

/**
 * A project's technologies grouped by their registry category. Groups come
 * in the order of their first technology, so the project's own order (its
 * main technologies first) still leads.
 */
export const groupTechnologies = (
  names: string[],
  registry: Technology[],
): TechnologyGroup[] => {
  const categoryOf = new Map(registry.map((tech) => [tech.name, tech.category]))
  const groups = new Map<string, string[]>()
  for (const name of names) {
    const category = categoryOf.get(name) ?? OTHER_CATEGORY
    groups.set(category, [...(groups.get(category) ?? []), name])
  }
  return [...groups].map(([category, grouped]) => ({
    category,
    names: grouped,
  }))
}
