/** Contact form submission (`ContactRequest`). */
export interface ContactPayload {
  name: string
  email: string
  message: string
  /** Honeypot field; must stay empty for legitimate users. */
  website: string
}

/** Acknowledgement returned by the backend (`ContactResponse`). */
export interface ContactResponse {
  detail: string
}
