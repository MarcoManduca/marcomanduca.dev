import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { cn } from '@/utils/cn'

/**
 * Headings sized like the page's section titles (and clear of the sticky
 * header when a contents link jumps to them); diagrams sit on paper, since
 * they are drawn in dark ink, centred and never stretched past their size.
 */
const BODY = cn(
  'min-w-0 text-lg',
  '[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-[28px] [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-none sm:[&_h2]:text-[32px]',
  '[&_.markdown>h2:first-child]:mt-0',
  '[&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:bg-card [&_img]:p-3 sm:[&_img]:p-5',
)

interface ProjectBodyProps {
  markdown: string
}

/** The long read of the project, from its markdown. */
export const ProjectBody = ({ markdown }: ProjectBodyProps) => (
  <div className={BODY}>
    <MarkdownRenderer content={markdown} />
  </div>
)
