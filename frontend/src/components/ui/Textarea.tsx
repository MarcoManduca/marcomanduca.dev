import type { TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export const Textarea = ({ label, className, id, ...props }: TextareaProps) => {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-heading">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={5}
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
