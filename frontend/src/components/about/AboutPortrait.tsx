import { useTranslation } from 'react-i18next'

import portrait420 from '@/assets/about-portrait-420.webp'
import portrait680 from '@/assets/about-portrait-680.webp'
import portrait1020 from '@/assets/about-portrait-1020.webp'
import { cn } from '@/utils/cn'

interface AboutPortraitProps {
  className?: string
}

/**
 * The real photo, beside the bio: the Home card is illustrated, so this is
 * where a visitor checking the CV sees the person. Framed in the same foil
 * gradient as the character card.
 *
 * On phones the page gives it a full-width row (up to 420px, like the Home
 * card; 1020w covers it at 3x); from `sm` it floats
 * into the bio, a 4:5 portrait the text wraps around. From `xl` it sits in
 * its own column and takes the height of the bio instead of imposing its own (the image is absolutely
 * positioned, so it adds nothing to the row): the sections below don't
 * move, and the crop stays on the face.
 */
export const AboutPortrait = ({ className }: AboutPortraitProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'w-full max-w-[15rem] rounded-[22px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-1.5 shadow-xl shadow-black/20 xl:relative xl:min-h-[12rem]',
        className,
      )}
    >
      <img
        src={portrait420}
        srcSet={`${portrait420} 420w, ${portrait680} 680w, ${portrait1020} 1020w`}
        sizes="(min-width: 1280px) 15rem, (min-width: 640px) 10rem, min(26.25rem, 100vw - 2rem)"
        alt={t('about.portraitAlt')}
        width={420}
        height={525}
        loading="lazy"
        decoding="async"
        className="aspect-[4/5] w-full rounded-[17px] object-cover object-[center_30%] xl:absolute xl:inset-1.5 xl:aspect-auto xl:h-[calc(100%-0.75rem)] xl:w-[calc(100%-0.75rem)]"
      />
    </div>
  )
}
