import type { Footprint } from '@/types'
import { FOOTPRINT_SIZE } from '@/utils/footprintGeometry'

/** The viewBox (20×40) keeps the 1:2 ratio of `FOOTPRINT_SIZE`. */
const { width: WIDTH, height: HEIGHT } = FOOTPRINT_SIZE

interface FootprintMarkProps {
  print: Footprint
  onFaded: () => void
}

/**
 * One bare footprint, toes up, drawn as a left foot and mirrored for the
 * right. It fades in and out on its own, then asks to be removed.
 */
export const FootprintMark = ({ print, onFaded }: FootprintMarkProps) => (
  <svg
    viewBox="0 0 20 40"
    width={WIDTH}
    height={HEIGHT}
    data-foot={print.side}
    onAnimationEnd={onFaded}
    className="absolute left-0 top-0 animate-footprint fill-current text-muted/45"
    style={{
      transform: `translate(${print.x - WIDTH / 2}px, ${print.y - HEIGHT / 2}px) rotate(${print.rotate}deg)`,
    }}
  >
    <g transform={print.side === 'right' ? 'matrix(-1 0 0 1 20 0)' : undefined}>
      <path d="M15 14C18 17 17.5 23 15 26C13 28.5 13.5 31 13.5 33C13.5 37 11 39.5 8.5 39.5C5.5 39.5 4 37 4.2 33.5C4.5 29 3 25 3.5 20C4 15.5 10 12.5 15 14Z" />
      <circle cx="14.5" cy="8.5" r="3" />
      <circle cx="9.8" cy="7" r="2.1" />
      <circle cx="6.6" cy="8.3" r="1.8" />
      <circle cx="4.3" cy="10.6" r="1.5" />
      <circle cx="2.8" cy="13.6" r="1.25" />
    </g>
  </svg>
)
