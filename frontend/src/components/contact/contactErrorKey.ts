const STATUS_KEYS: Record<number, string> = {
  422: 'contacts.errors.validation',
  429: 'contacts.errors.rateLimited',
}

/** Map a failed contact submission to the i18n key explaining it. */
export const contactErrorKey = (error: unknown): string => {
  const status = (error as { status?: unknown } | null)?.status
  return (
    (typeof status === 'number' && STATUS_KEYS[status]) ||
    'contacts.errors.generic'
  )
}
