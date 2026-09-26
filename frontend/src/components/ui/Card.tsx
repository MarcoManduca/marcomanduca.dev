import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-2xl border-2 border-edge bg-surface p-6 transition-colors hover:border-warm/70',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
