import { useState, type FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useUnlockOnMount } from '@/hooks/useUnlockOnMount'
import { useSendContactMutation } from '@/services/contactApi'

import { ConsentCheckbox } from './ConsentCheckbox'
import { contactErrorKey } from './contactErrorKey'
import { HONEYPOT_FIELD, HoneypotField } from './HoneypotField'

/** Mirrors the backend limits (ContactRequest in backend/src/schemas/contact.py). */
const MAX_LENGTH = { name: 120, email: 254, message: 5000 }

export const ContactForm = () => {
  const { t } = useTranslation()
  const [sendContact, { isLoading, isSuccess, isError, error }] =
    useSendContactMutation()
  const [honeypotTriggered, setHoneypotTriggered] = useState(false)
  const [consent, setConsent] = useState(false)
  useUnlockOnMount('contact', isSuccess)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot: bots fill the hidden "website" field. Pretend success.
    if (data.get(HONEYPOT_FIELD)) {
      setHoneypotTriggered(true)
      return
    }

    await sendContact({
      name: String(data.get('name')),
      email: String(data.get('email')),
      message: String(data.get('message')),
      website: '',
    })
  }

  if (isSuccess || honeypotTriggered) {
    return (
      <p role="status" className="rounded-lg bg-success/15 p-4 text-success">
        {t('contacts.success')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <Input
        label={t('contacts.nameLabel')}
        name="name"
        autoComplete="name"
        maxLength={MAX_LENGTH.name}
        required
      />
      <Input
        label={t('contacts.emailLabel')}
        name="email"
        type="email"
        autoComplete="email"
        maxLength={MAX_LENGTH.email}
        required
      />
      <Textarea
        label={t('contacts.messageLabel')}
        name="message"
        maxLength={MAX_LENGTH.message}
        required
      />
      <HoneypotField />
      <ConsentCheckbox checked={consent} onChange={setConsent} />
      {isError && (
        <p role="alert" className="rounded-lg bg-danger/15 p-4 text-danger">
          {t(contactErrorKey(error))}
        </p>
      )}
      <Button
        type="submit"
        disabled={isLoading || !consent}
        className="self-start"
      >
        {isLoading ? t('contacts.sending') : t('contacts.submit')}
      </Button>
    </form>
  )
}
