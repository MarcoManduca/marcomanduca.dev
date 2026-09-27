import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

import { headingId } from './headingId'

/** Heading level that gets an anchor id and a table-of-contents entry. */
export const TOC_DEPTH = 2
/** Id of a heading whose text has no letter or digit left. */
const FALLBACK_ID = 'section'

const uniqueId = (base: string, taken: Set<string>): string => {
  let id = base
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`
  taken.add(id)
  return id
}

/**
 * remark plugin giving each second-level heading an anchor id built from its
 * text as the page shows it: `## The load_data step` → `the-load-data-step`,
 * `## Using [dbt](…)` → `using-dbt`. Repeated headings get `-2`, `-3`, … so
 * ids stay unique. The renderer and the table of contents both run it (see
 * `REMARK_PLUGINS`), so every link matches its target.
 */
export const remarkHeadingIds = () => (tree: Root) => {
  const taken = new Set<string>()
  visit(tree, 'heading', (node) => {
    if (node.depth !== TOC_DEPTH) return
    const id = uniqueId(headingId(toString(node)) || FALLBACK_ID, taken)
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
  })
}
