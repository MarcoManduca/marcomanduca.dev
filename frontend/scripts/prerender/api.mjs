/**
 * Public API reads for the build-time pre-render.
 *
 * The API is called through CloudFront (which injects the origin-verify
 * header) and returns only published content, so drafts never leak into
 * the sitemap or the pre-rendered pages.
 */

/** A hung API must not stall the build. */
export const FETCH_TIMEOUT_MS = 10_000

/**
 * Fetch a public collection (a JSON array) from the API.
 *
 * Lenient by default: any failure is logged and yields `[]`, so local and CI
 * builds work without the API. With `strict` (deploys) a failure throws
 * instead of publishing a site without its dynamic pages.
 *
 * @param {string} apiUrl API base URL, e.g. https://marcomanduca.dev/api/v1
 * @param {string} path Collection path, e.g. /projects
 * @param {{ fetchImpl?: typeof fetch, timeoutMs?: number, strict?: boolean }} [options]
 * @returns {Promise<unknown[]>}
 */
export async function fetchCollection(
  apiUrl,
  path,
  { fetchImpl = fetch, timeoutMs = FETCH_TIMEOUT_MS, strict = false } = {},
) {
  try {
    const response = await fetchImpl(`${apiUrl}${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const items = await response.json()
    if (!Array.isArray(items)) throw new Error('not a JSON array')
    return items
  } catch (error) {
    if (strict) {
      throw new Error(`Pre-render: could not fetch ${path} (${error.message})`)
    }
    console.warn(
      `Pre-render: could not fetch ${path} (${error.message}); skipping those pages.`,
    )
    return []
  }
}
