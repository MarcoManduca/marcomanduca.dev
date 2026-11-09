import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DownloadCvButton } from '@/components/about/DownloadCvButton'
import profile from '@/data/profile.json'
import { cn } from '@/utils/cn'

/** Button-sized action, shared by the CV button and the two links. */
const ACTION =
  'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-0 font-display text-base font-bold uppercase tracking-[0.04em] transition-colors'
const OUTLINE =
  'border-2 border-edge text-heading hover:border-highlight hover:text-highlight'

/**
 * The shortcuts a recruiter looks for first, under the character card: the
 * CV, LinkedIn and the contact form. One row where the column is wide enough
 * (from `sm`, and from `xl` beside the quest log), stacked in the narrower
 * `lg` column, CV over the two links on phones.
 */
export const HeroActions = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('home.hero.label')}
      className="mx-auto grid w-full max-w-[420px] grid-cols-2 gap-3 sm:flex lg:flex-col xl:flex-row"
    >
      <div className="col-span-2 sm:flex-auto">
        <DownloadCvButton className={cn(ACTION, 'w-full')} />
      </div>
      <a
        href={profile.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(ACTION, OUTLINE, 'sm:flex-auto')}
      >
        LinkedIn ↗
      </a>
      <Link to="/contacts" className={cn(ACTION, OUTLINE, 'sm:flex-auto')}>
        {t('home.hero.contact')}
      </Link>
    </section>
  )
}
