/** Look of a project card by category: foil frame, type chip and its icon. */
interface CategoryStyle {
  /** Gradient stops of the card's foil frame (brand colours, any theme). */
  frame: string
  chip: string
  /** Path data of the chip icon, stroked on a 24×24 box. */
  icon: readonly string[]
}

const STYLES: Record<string, CategoryStyle> = {
  data: {
    frame: 'from-brand-yellow via-brand-orange to-brand-teal',
    chip: 'bg-highlight/15 text-highlight',
    icon: ['M3 20h18', 'M6 16V9', 'M11 16V5', 'M16 16v-4'],
  },
  cloud: {
    frame: 'from-brand-cyan via-brand-teal to-brand-yellow',
    chip: 'bg-accent/15 text-accent',
    icon: ['M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18Z'],
  },
  backend: {
    frame: 'from-brand-orange via-brand-teal to-brand-cyan',
    chip: 'bg-warm/15 text-warm',
    icon: ['M4 4h16v7H4z', 'M4 13h16v7H4z', 'M8 7.5h.01', 'M8 16.5h.01'],
  },
  frontend: {
    frame: 'from-brand-cyan via-brand-yellow to-brand-orange',
    chip: 'bg-accent/15 text-accent',
    icon: ['M3 5h18v14H3z', 'M3 9h18', 'M7 13h6', 'M7 16h4'],
  },
  other: {
    frame: 'from-brand-teal via-brand-cyan to-brand-teal',
    chip: 'bg-edge text-body',
    icon: ['M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z'],
  },
}

/** Frame of the face-down card that closes the deck. */
export const NEXT_CARD_FRAME = 'from-edge via-surface to-edge'

/** Style of a category; unknown ones look like "other". */
export const categoryStyle = (category: string): CategoryStyle =>
  STYLES[category] ?? STYLES.other
