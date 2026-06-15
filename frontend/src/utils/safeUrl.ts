const SAFE_PROTOCOLS = ['http:', 'https:']

/**
 * Return the URL only when it uses an http(s) scheme, else `undefined`.
 *
 * Defense-in-depth against stored `javascript:`/`data:` URLs reaching an
 * anchor `href`, even though the backend already rejects them on write.
 */
export const safeExternalUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? url : undefined
  } catch {
    return undefined
  }
}
