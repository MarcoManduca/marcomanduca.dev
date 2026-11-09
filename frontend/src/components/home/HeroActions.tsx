import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DownloadCvButton } from '@/components/about/DownloadCvButton'
import profile from '@/data/profile.json'
import { cn } from '@/utils/cn'

/** Button-sized action, shared by the CV button and the two links. */
const ACTION =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 py-0 font-display text-base font-bold uppercase tracking-[0.04em] transition-colors'
const OUTLINE =
  'border-2 border-edge text-heading hover:border-highlight hover:text-highlight'

/**
 * One-line pitch under the character card, with the shortcuts a recruiter
 * looks for first: the CV, LinkedIn and the contact form.
 */
export const HeroActions = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('home.hero.label')}
      className="mx-auto flex w-full max-w-[420px] flex-col gap-5"
    >
      <p className="text-lg text-body">{t('home.card.description')}</p>
      <div className="flex flex-wrap gap-3">
        <DownloadCvButton className={ACTION} />
        <a
          href={profile.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ACTION, OUTLINE)}
        >
          LinkedIn ↗
        </a>
        <Link to="/contacts" className={cn(ACTION, OUTLINE)}>
          {t('home.hero.contact')}
        </Link>
      </div>
    </section>
  )
}
