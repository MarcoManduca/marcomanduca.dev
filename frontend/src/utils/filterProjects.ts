import type {
  LocalizedText,
  ProjectArea,
  ProjectContext,
  ProjectSummary,
} from '@/types'

/** Filters of the Projects page; an empty string means "any". */
export interface ProjectFiltersValue {
  search: string
  area: ProjectArea | ''
  context: ProjectContext | ''
  technology: string
}

export const EMPTY_PROJECT_FILTERS: ProjectFiltersValue = {
  search: '',
  area: '',
  context: '',
  technology: '',
}

const matchesSearch = (
  project: ProjectSummary,
  search: string,
  localize: (text: LocalizedText) => string,
) =>
  `${localize(project.title)} ${localize(project.description)}`
    .toLowerCase()
    .includes(search.toLowerCase())

/** Projects matching every filter that is set. */
export const filterProjects = (
  projects: ProjectSummary[],
  filters: ProjectFiltersValue,
  localize: (text: LocalizedText) => string,
): ProjectSummary[] =>
  projects.filter(
    (project) =>
      (!filters.area || project.areas.includes(filters.area)) &&
      (!filters.context || project.context === filters.context) &&
      (!filters.technology ||
        project.technologies.includes(filters.technology)) &&
      (!filters.search || matchesSearch(project, filters.search, localize)),
  )
