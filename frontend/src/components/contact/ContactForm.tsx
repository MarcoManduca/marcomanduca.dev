import { useState, type FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useSendContactMutation } from '@/services/contactApi'

export const ContactForm = () => {
  const { t } = useTranslation()
  const [sendContact, { isLoading, isSuccess, isError }] =
    useSendContactMutation()
  const [honeypotTriggered, setHoneypotTriggered] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot: bots fill the hidden "website" field. Pretend success.
    if (data.get('website')) {
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
      <p
        role="status"
        className="rounded-lg bg-emerald-500/15 p-4 text-emerald-400"
      >
        {t('contacts.success')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <Input label={t('contacts.nameLabel')} name="name" required />
      <Input
        label={t('contacts.emailLabel')}
        name="email"
        type="email"
        required
      />
      <Textarea label={t('contacts.messageLabel')} name="message" required />
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {isError && (
        <p role="alert" className="rounded-lg bg-red-500/15 p-4 text-red-400">
          {t('contacts.error')}
        </p>
      )}
      <Button type="submit" disabled={isLoading} className="self-start">
        {isLoading ? t('contacts.sending') : t('contacts.submit')}
      </Button>
    </form>
  )
}
