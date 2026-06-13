import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'

import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Input = ({ label, className, id, ...props }: InputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-heading">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-body',
          'placeholder:text-muted focus:border-accent focus:outline-none',
          className,
        )}
        {...props}
      />
    </div>
  )
}
