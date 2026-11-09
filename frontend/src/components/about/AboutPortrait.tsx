import { useTranslation } from 'react-i18next'

import portrait420 from '@/assets/about-portrait-420.webp'
import portrait680 from '@/assets/about-portrait-680.webp'
import { cn } from '@/utils/cn'

interface AboutPortraitProps {
  className?: string
}

/**
 * The real photo, beside the bio: the Home card is illustrated, so this is
 * where a visitor checking the CV sees the person. Framed in the same foil
 * gradient as the character card. At most 15rem wide (480px at 2x).
 */
export const AboutPortrait = ({ className }: AboutPortraitProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'w-full max-w-[15rem] rounded-[22px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-1.5 shadow-xl shadow-black/20',
        className,
      )}
    >
      <img
        src={portrait420}
        srcSet={`${portrait420} 420w, ${portrait680} 680w`}
        sizes="15rem"
        alt={t('about.portraitAlt')}
        width={420}
        height={525}
        loading="lazy"
        decoding="async"
        className="aspect-[4/5] w-full rounded-[17px] object-cover object-top"
      />
    </div>
  )
}
