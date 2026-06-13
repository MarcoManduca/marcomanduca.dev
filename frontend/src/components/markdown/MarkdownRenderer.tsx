import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

interface MarkdownRendererProps {
  content: string
}

/** Render markdown with syntax highlighting and LaTeX support. */
export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="markdown">
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </div>
)
