import { useTranslation } from 'react-i18next'

import heroImage from '@/assets/hero-512.webp'

/** Framed portrait in the character card "artwork" window. */
export const CardPortrait = () => {
  const { t } = useTranslation()

  return (
    <div className="h-64 overflow-hidden rounded-lg border-[3px] border-card-ink bg-brand-teal sm:h-[300px]">
      <img
        src={heroImage}
        alt={t('home.card.portraitAlt')}
        width={512}
        height={512}
        loading="eager"
        decoding="async"
        className="h-full w-full object-cover object-top"
      />
    </div>
  )
}
