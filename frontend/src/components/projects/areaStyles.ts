import type { ProjectArea } from '@/types'

/** Colour family of an area, as grouped by the Projects filters. */
export type AreaFamily = 'build' | 'data' | 'intelligence'

interface FamilyStyle {
  /** Gradient stops of the card's foil frame (brand colours, any theme). */
  frame: string
  chip: string
}

interface AreaStyle extends FamilyStyle {
  family: AreaFamily
  /** Path data of the chip icon, stroked on a 24×24 box. */
  icon: readonly string[]
}

const FAMILIES: Record<AreaFamily, FamilyStyle> = {
  build: {
    frame: 'from-brand-cyan via-brand-teal to-brand-yellow',
    chip: 'bg-accent/15 text-accent',
  },
  data: {
    frame: 'from-brand-yellow via-brand-orange to-brand-teal',
    chip: 'bg-highlight/15 text-highlight',
  },
  intelligence: {
    frame: 'from-brand-orange via-brand-teal to-brand-cyan',
    chip: 'bg-warm/15 text-warm',
  },
}

/** A small circle as path data, so every icon is a list of paths. */
const dot = (cx: number, cy: number) =>
  `M${cx - 2} ${cy}a2 2 0 1 0 4 0a2 2 0 1 0-4 0`

const AREAS: Record<ProjectArea, Omit<AreaStyle, keyof FamilyStyle>> = {
  frontend: {
    family: 'build',
    icon: ['M3 5h18v14H3z', 'M3 9h18', 'M7 13h6', 'M7 16h4'],
  },
  backend: {
    family: 'build',
    icon: ['M4 4h16v7H4z', 'M4 13h16v7H4z', 'M8 7.5h.01', 'M8 16.5h.01'],
  },
  cloud: {
    family: 'build',
    icon: ['M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18Z'],
  },
  data: {
    family: 'data',
    icon: ['M3 20h18', 'M6 16V9', 'M11 16V5', 'M16 16v-4'],
  },
  ml: {
    family: 'intelligence',
    icon: [
      dot(12, 5),
      dot(6, 18),
      dot(18, 18),
      'M11 6.8 7 16.2',
      'm13 6.8 4 9.4',
    ],
  },
  dl: {
    family: 'intelligence',
    icon: [
      dot(5, 7),
      dot(5, 17),
      dot(12, 12),
      dot(19, 7),
      dot(19, 17),
      'm6.8 8.2 3.4 2.6M6.8 15.8l3.4-2.6m3.6-2.4 3.4-2.6m-3.4 5 3.4 2.6',
    ],
  },
  ai: {
    family: 'intelligence',
    icon: ['M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z'],
  },
}

/** Look of an area: its family's frame and chip, plus its own icon. */
export const areaStyle = (area: ProjectArea): AreaStyle => {
  const style = AREAS[area]
  return { ...style, ...FAMILIES[style.family] }
}
