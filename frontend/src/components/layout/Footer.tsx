import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-edge/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row">
        <p>
          © {year} Marco Manduca. {t('footer.rights')}
        </p>
        <Link
          to="/privacy-policy"
          className="font-display font-bold uppercase tracking-wider text-body transition-colors hover:text-highlight"
        >
          {t('footer.privacy')}
        </Link>
      </div>
    </footer>
  )
}
