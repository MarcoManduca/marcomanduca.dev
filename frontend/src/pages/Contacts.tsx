import { useTranslation } from 'react-i18next'

import { ContactForm } from '@/components/contact/ContactForm'
import { Seo } from '@/components/seo/Seo'

export const Contacts = () => {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('contacts.title')} description={t('contacts.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('contacts.title')}</h1>
      <p className="mt-2 text-muted">{t('contacts.subtitle')}</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </>
  )
}
