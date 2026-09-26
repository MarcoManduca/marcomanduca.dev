import { useTranslation } from 'react-i18next'

import heroImage from '@/assets/hero-512.webp'

/** 1x1 transparent GIF: the only thing phones fetch, as the portrait is md+ only. */
const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/** Decorative portrait with glow, rendered (and downloaded) from `md` up. */
export const HeroPortrait = () => {
  const { t } = useTranslation()

  return (
    <div className="relative hidden shrink-0 motion-safe:animate-fade-in-scale md:block">
      <div
        aria-hidden
        className="absolute -left-8 -top-8 h-60 w-60 rounded-[2.5rem] bg-accent/60 blur-2xl lg:h-64 lg:w-64"
      />
      <div
        aria-hidden
        className="absolute -bottom-8 -right-8 h-60 w-60 rounded-[2.5rem] bg-warm/55 blur-2xl lg:h-64 lg:w-64"
      />
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={heroImage}
          type="image/webp"
        />
        <img
          src={BLANK_PIXEL}
          alt={t('home.heroName')}
          width={512}
          height={512}
          loading="eager"
          decoding="async"
          className="relative h-60 w-60 rounded-[2rem] border border-edge object-cover object-top shadow-xl lg:h-64 lg:w-64"
        />
      </picture>
    </div>
  )
}
