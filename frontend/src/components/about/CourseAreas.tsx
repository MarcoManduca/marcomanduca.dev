import { useId } from 'react'

import { useTranslation } from 'react-i18next'

import { Tag } from '@/components/ui/Tag'

import { COURSE_LABEL } from './styles'

interface CourseAreasProps {
  areas: string[]
}

/** The main areas of study of a course, as tags. */
export const CourseAreas = ({ areas }: CourseAreasProps) => {
  const { t } = useTranslation()
  const labelId = useId()

  return (
    <div className="mt-4 text-left">
      <p id={labelId} className={COURSE_LABEL}>
        {t('about.courseAreas')}
      </p>
      <ul aria-labelledby={labelId} className="mt-2 flex flex-wrap gap-1.5">
        {areas.map((area) => (
          <li key={area}>
            <Tag label={area} />
          </li>
        ))}
      </ul>
    </div>
  )
}
