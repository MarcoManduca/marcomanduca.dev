import type { Point } from '@/types'

/** Controls and media are content wherever they sit. */
const CONTENT =
  'a, button, input, select, textarea, label, img, svg, video, canvas, [role="button"], [contenteditable="true"]'

const holdsText = (element: Element) =>
  Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  )

const isTransparent = (color: string) =>
  !color || color === 'transparent' || /,\s*0\)$/.test(color)

/** A background, gradient or border: the element draws a surface. */
const paintsSurface = (element: Element) => {
  const style = getComputedStyle(element)
  const image = style.backgroundImage
  return (
    !isTransparent(style.backgroundColor) ||
    (Boolean(image) && image !== 'none') ||
    [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ].some((width) => parseFloat(width) > 0)
  )
}

/**
 * Whether `target` is the empty background of the page: it holds no text,
 * control or media, and no card, panel or other surface wraps it, up to the
 * page's own background on <body>.
 */
export const isFloor = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false
  if (target.closest(CONTENT) || holdsText(target)) return false
  for (
    let element: Element | null = target;
    element && element !== document.body;
    element = element.parentElement
  ) {
    if (paintsSurface(element)) return false
  }
  return true
}

/** `isFloor` for whatever is drawn at a point of the viewport. */
export const isFloorAt = ({ x, y }: Point): boolean =>
  isFloor(document.elementFromPoint(x, y))
