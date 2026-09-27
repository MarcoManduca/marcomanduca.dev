import { useFootprints } from '@/hooks/useFootprints'

import { FootprintMark } from './FootprintMark'

/**
 * Footprints trailing the mouse across the empty background, drawn behind
 * the page content (above the contour lines) so cards and text cover them.
 */
export const Footprints = () => {
  const { layerRef, prints, remove } = useFootprints()

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {prints.map((print) => (
        <FootprintMark
          key={print.id}
          print={print}
          onFaded={() => remove(print.id)}
        />
      ))}
    </div>
  )
}
