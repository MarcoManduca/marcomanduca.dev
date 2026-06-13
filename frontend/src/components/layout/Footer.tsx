import { useTranslation } from 'react-i18next'

export const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 py-6 text-center text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          © {year} Marco Manduca. {t('footer.rights')}
        </p>
        <p>{t('footer.builtWith')}</p>
      </div>
    </footer>
  )
}
