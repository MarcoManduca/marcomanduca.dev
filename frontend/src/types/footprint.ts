/** A point in pixels. */
export interface Point {
  x: number
  y: number
}

/** A print placed on screen: its centre and the direction of its toes. */
export interface Placement extends Point {
  /** Degrees clockwise; 0 points the toes up the page. */
  rotate: number
}

/** Which foot left a print: they alternate along the path. */
export type FootSide = 'left' | 'right'

/** One print on the background, in the footprints layer's pixels. */
export interface Footprint extends Placement {
  id: number
  side: FootSide
}
