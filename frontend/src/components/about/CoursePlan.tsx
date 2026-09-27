import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'
import { cn } from '@/utils/cn'

import { COURSE_LABEL } from './styles'

const CHEVRON = ['m6 9 6 6 6-6']

interface CoursePlanProps {
  /** Courses of the study plan, in reading order. */
  courses: string[]
}

/** The study plan of a degree, folded away under its course count. */
export const CoursePlan = ({ courses }: CoursePlanProps) => {
  const { t } = useTranslation()

  return (
    <details className="group mt-4 rounded-xl border border-edge text-left">
      <summary
        className={cn(
          COURSE_LABEL,
          'flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 hover:text-heading [&::-webkit-details-marker]:hidden',
        )}
      >
        {t('about.coursePlan', { count: courses.length })}
        <StrokeIcon
          paths={CHEVRON}
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="list-disc gap-8 border-t border-edge py-3 pl-8 pr-4 text-sm marker:text-highlight sm:columns-2">
        {courses.map((course) => (
          <li key={course} className="break-inside-avoid py-0.5">
            {course}
          </li>
        ))}
      </ul>
    </details>
  )
}
