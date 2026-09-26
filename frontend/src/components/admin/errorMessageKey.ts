const STATUS_KEYS: Record<number, string> = {
  401: 'admin.errors.unauthorized',
  403: 'admin.errors.forbidden',
  422: 'admin.errors.validation',
}

/** Map an RTK Query (or unknown) error to the i18n key explaining it. */
export const errorMessageKey = (error: unknown): string => {
  const status = (error as { status?: unknown } | null)?.status
  return (
    (typeof status === 'number' && STATUS_KEYS[status]) ||
    'admin.errors.generic'
  )
}
