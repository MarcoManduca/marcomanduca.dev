import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'

import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
}

export const Select = ({
  label,
  options,
  className,
  id,
  ...props
}: SelectProps) => {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-heading">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          'rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-body',
          'focus:border-accent focus:outline-none',
          className,
        )}
        {...props}
      >
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
