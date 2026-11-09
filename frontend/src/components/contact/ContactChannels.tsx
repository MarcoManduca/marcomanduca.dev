import { useTranslation } from 'react-i18next'

import { SocialLinks } from '@/components/layout/SocialLinks'
import { Card } from '@/components/ui/Card'

const CHANNEL_LINK =
  'font-display text-lg font-bold uppercase tracking-wider text-accent transition-colors hover:text-highlight'

/** Direct channels shown next to the contact form. */
export const ContactChannels = () => {
  const { t } = useTranslation()

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-bold uppercase text-heading">
        {t('contacts.channels.title')}
      </h2>
      <p className="text-sm text-muted">{t('contacts.channels.text')}</p>
      <SocialLinks className="flex-col" linkClassName={CHANNEL_LINK} />
    </Card>
  )
}
