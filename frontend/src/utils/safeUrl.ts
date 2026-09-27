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

/**
 * A path on this site, like `/images/…`; not `//host` nor `/\host`. No
 * whitespace or control characters either: browsers strip tabs and newlines
 * from URLs, so `/<tab>/host` would load `//host`.
 */
const SITE_PATH = /^\/(?![/\\])[^\s\p{Cc}]*$/u

/**
 * Return an image source the page may load, else `undefined`: an http(s)
 * URL, or a path on the site itself (images shipped in `public/`).
 */
export const safeMediaUrl = (src?: string | null): string | undefined => {
  if (!src) return undefined
  return SITE_PATH.test(src) ? src : safeExternalUrl(src)
}
