import { useTranslation } from 'react-i18next'

import { ContactChannels } from '@/components/contact/ContactChannels'
import { ContactForm } from '@/components/contact/ContactForm'
import { Seo } from '@/components/seo/Seo'

export const Contacts = () => {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('contacts.title')} description={t('contacts.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('contacts.title')}</h1>
      <p className="mt-2 text-muted">{t('contacts.subtitle')}</p>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ContactForm />
        <ContactChannels />
      </div>
    </>
  )
}
