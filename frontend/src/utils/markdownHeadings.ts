import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { REMARK_PLUGINS } from './markdownPlugins'
import { TOC_DEPTH } from './remarkHeadingIds'

export interface Heading {
  id: string
  text: string
}

const processor = unified().use(remarkParse).use(REMARK_PLUGINS)

/**
 * Second-level headings of a markdown text, for a table of contents. The
 * text is what the page shows (no link or emphasis syntax) and the ids are
 * the ones `MarkdownContent` gives the rendered headings: both run the same
 * parser and plugins. Lines inside fenced code are not headings to the
 * parser, so they never show up.
 */
export const markdownHeadings = (markdown: string): Heading[] => {
  const tree = processor.runSync(processor.parse(markdown)) as Root
  const headings: Heading[] = []
  visit(tree, 'heading', (node) => {
    const id = node.data?.hProperties?.id
    if (node.depth === TOC_DEPTH && typeof id === 'string') {
      headings.push({ id, text: toString(node) })
    }
  })
  return headings
}
