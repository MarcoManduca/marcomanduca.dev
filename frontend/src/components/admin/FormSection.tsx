import type { ReactNode } from 'react'

interface FormSectionProps {
  legend: string
  children: ReactNode
}

/** A titled group of admin form fields, two columns from `sm`. */
export const FormSection = ({ legend, children }: FormSectionProps) => (
  <fieldset className="grid gap-4 rounded-xl border border-edge p-4 sm:grid-cols-2">
    <legend className="px-1 font-display text-lg font-bold uppercase text-heading">
      {legend}
    </legend>
    {children}
  </fieldset>
)
