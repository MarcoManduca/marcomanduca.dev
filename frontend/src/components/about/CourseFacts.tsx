import { useTranslation } from 'react-i18next'

import { COURSE_LABEL } from './styles'

export interface CourseFact {
  label: string
  value: string
}

interface CourseFactsProps {
  facts: CourseFact[]
}

/** Class or level, duration, credits and language of a course, in a grid. */
export const CourseFacts = ({ facts }: CourseFactsProps) => {
  const { t } = useTranslation()

  return (
    <dl
      aria-label={t('about.courseFacts')}
      className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-4"
    >
      {facts.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 rounded-xl border border-edge px-3 py-2"
        >
          <dt className={COURSE_LABEL}>{label}</dt>
          <dd className="font-display text-lg font-bold leading-tight text-heading">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
