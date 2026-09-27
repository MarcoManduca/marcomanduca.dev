import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'

import { CARD_LINK, COURSE_LABEL } from './styles'

const BADGE = [
  'M6 8a6 6 0 1 0 12 0a6 6 0 1 0-12 0',
  'M15.5 12.9 17 22l-5-3-5 3 1.5-9.1',
]

export interface Certificate {
  /** Official name, as the issuer's verification page shows it. */
  name: string
  /** Month it became active, e.g. `November 2019`. */
  since: string
  /** Public verification page of the credential. */
  url: string
}

interface CourseCertificateProps {
  certificate: Certificate
}

/** A certification earned along a course, with a link to verify it. */
export const CourseCertificate = ({
  certificate: { name, since, url },
}: CourseCertificateProps) => {
  const { t } = useTranslation()

  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-highlight/40 bg-highlight/5 px-4 py-3 text-left">
      <StrokeIcon
        paths={BADGE}
        className="mt-0.5 h-5 w-5 shrink-0 text-highlight"
      />
      <div>
        <p className={COURSE_LABEL}>{t('about.certificate')}</p>
        <p className="mt-0.5 font-semibold text-heading">{name}</p>
        <p className="mt-1 text-sm text-muted">
          {t('about.certificateSince', { date: since })} ·{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={CARD_LINK}
          >
            {t('about.certificateVerify')} ↗
          </a>
        </p>
      </div>
    </div>
  )
}
