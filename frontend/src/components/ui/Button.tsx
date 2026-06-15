import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Bright cyan accent; lightens on hover.
  primary: 'bg-accent text-white hover:bg-accent-hover',
  // Warm accent for the primary conversion action; dark text for contrast.
  cta: 'bg-warm text-background hover:bg-warm-hover',
  secondary:
    'border border-edge bg-surface text-heading hover:border-accent hover:text-accent-hover',
  ghost: 'text-body hover:bg-surface hover:text-heading',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

export const Button = ({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
