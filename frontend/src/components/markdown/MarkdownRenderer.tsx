import { lazy, Suspense } from 'react'

import { Spinner } from '@/components/ui/Spinner'

const MarkdownContent = lazy(() => import('./MarkdownContent'))

interface MarkdownRendererProps {
  content: string
}

/**
 * Render markdown with syntax highlighting and LaTeX support.
 *
 * The actual renderer (react-markdown + KaTeX + highlight.js) is code-split
 * and loaded on demand, keeping those heavy dependencies out of the initial
 * bundle. See `MarkdownContent` for the security posture.
 */
export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="markdown">
    <Suspense fallback={<Spinner />}>
      <MarkdownContent content={content} />
    </Suspense>
  </div>
)
