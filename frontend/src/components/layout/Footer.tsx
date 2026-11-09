import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import profile from '@/data/profile.json'

import { SocialLinks } from './SocialLinks'

const FOOTER_LINK =
  'font-display font-bold uppercase tracking-wider text-body transition-colors hover:text-highlight'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-edge/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row">
        <p>
          © {year} {profile.name}. {t('footer.rights')}
        </p>
        <nav
          aria-label={t('footer.linksLabel')}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <SocialLinks linkClassName={FOOTER_LINK} />
          <Link to="/privacy-policy" className={FOOTER_LINK}>
            {t('footer.privacy')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
