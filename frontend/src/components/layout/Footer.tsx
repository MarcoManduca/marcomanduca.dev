import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-xs text-muted">
        <p>
          © {year} Marco Manduca. {t('footer.rights')}
        </p>
        <Link
          to="/privacy-policy"
          className="text-body transition-colors hover:text-heading"
        >
          {t('footer.privacy')}
        </Link>
      </div>
    </footer>
  )
}
