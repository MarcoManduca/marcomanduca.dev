import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

import { cn } from '@/utils/cn'

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: ReactNode
}

/** Checkbox with an inline label that may contain links or rich content. */
export const Checkbox = ({ label, className, id, ...props }: CheckboxProps) => {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <div className="flex items-start gap-2.5">
      <input
        id={checkboxId}
        type="checkbox"
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border-edge bg-surface text-accent',
          'focus:outline-none focus:ring-2 focus:ring-accent',
          className,
        )}
        {...props}
      />
      <label htmlFor={checkboxId} className="text-sm text-body">
        {label}
      </label>
    </div>
  )
}
