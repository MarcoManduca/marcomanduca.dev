/** Technology as returned by the backend (`TechnologyResponse`). */
export interface Technology {
  id: string
  name: string
  icon: string
  category: string
}

/** Payload to register a technology (`TechnologyCreate`). */
export type TechnologyInput = Omit<Technology, 'id'>
