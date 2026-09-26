/**
 * Whether an RTK Query error is an HTTP 404 from the API.
 *
 * Network failures, 5xx and serialized (thrown) errors return `false`, so
 * callers can tell "this resource does not exist" from "try again later".
 */
export const isNotFoundError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 404
