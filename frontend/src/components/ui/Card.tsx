import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-xl border border-edge bg-surface p-6 transition-colors hover:border-accent/50',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
