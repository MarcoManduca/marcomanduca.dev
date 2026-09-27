import { headingId } from './headingId'

export interface Heading {
  id: string
  text: string
}

const FENCE = /^\s*(```|~~~)/
const SECOND_LEVEL = /^##\s+(.+?)\s*#*\s*$/
/** Emphasis and code marks, which do not show in the rendered heading. */
const INLINE_MARKS = /[*_`]/g

/**
 * Second-level headings of a markdown text, for a table of contents. Their
 * ids match the ones `MarkdownRenderer` gives the rendered headings. Lines
 * inside fenced code are skipped.
 */
export const markdownHeadings = (markdown: string): Heading[] => {
  const headings: Heading[] = []
  let fenced = false
  for (const line of markdown.split('\n')) {
    if (FENCE.test(line)) fenced = !fenced
    const match = fenced ? null : SECOND_LEVEL.exec(line)
    if (match) {
      const text = match[1].replace(INLINE_MARKS, '')
      headings.push({ id: headingId(text), text })
    }
  }
  return headings
}
