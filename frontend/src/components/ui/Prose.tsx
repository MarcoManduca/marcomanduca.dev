import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Long-form reading container.
 *
 * A fixed-measure box whose width steps up by device — phone: full width ·
 * tablet: 700px · desktop: 820px — with justified, auto-hyphenated body text
 * for an even right edge. `text-align` and `hyphens` inherit, so nested prose
 * (e.g. markdown paragraphs) is covered without extra classes.
 */
export const Prose = ({ className, children, ...props }: ProseProps) => (
  <div
    className={cn(
      'max-w-full text-justify hyphens-auto sm:max-w-[700px] lg:max-w-[820px]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
