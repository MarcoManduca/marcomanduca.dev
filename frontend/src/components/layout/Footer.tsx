import { useTranslation } from 'react-i18next'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-edge">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted">
        <p>
          © {year} Marco Manduca. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
