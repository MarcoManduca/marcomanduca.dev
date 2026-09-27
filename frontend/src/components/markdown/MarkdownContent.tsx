import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

// Themes live with the renderer so they ship in its lazy chunk, not in the
// global stylesheet loaded by every page.
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

import { headingId } from '@/utils/headingId'
import { textOf } from '@/utils/textOf'

interface MarkdownContentProps {
  content: string
}

/**
 * Heavy markdown implementation (react-markdown + KaTeX + highlight.js).
 *
 * Isolated in its own module so it can be code-split: the public detail and
 * admin pages load it on demand instead of bloating the initial bundle.
 *
 * Security: raw HTML is never rendered. `rehype-raw` is intentionally absent
 * from the pipeline and `skipHtml` drops any embedded HTML nodes, so `<script>`
 * and similar tags cannot reach the DOM. react-markdown's default
 * `urlTransform` also strips dangerous link protocols (e.g. `javascript:`).
 * Heading ids come from the heading text (`headingId`), never from raw HTML.
 */
/** Second-level headings carry an anchor id, for a table of contents. */
const COMPONENTS: Components = {
  h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
}

const MarkdownContent = ({ content }: MarkdownContentProps) => (
  <ReactMarkdown
    skipHtml
    components={COMPONENTS}
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeHighlight, rehypeKatex]}
  >
    {content}
  </ReactMarkdown>
)

export default MarkdownContent
