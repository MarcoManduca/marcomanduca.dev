/** Name of the hidden anti-spam field: humans leave it empty, bots fill it. */
export const HONEYPOT_FIELD = 'website'

/** Visually hidden, non-focusable honeypot input for the contact form. */
export const HoneypotField = () => (
  <div aria-hidden="true" className="hidden">
    <label htmlFor="contact-website">Website</label>
    <input
      id="contact-website"
      name={HONEYPOT_FIELD}
      type="text"
      tabIndex={-1}
      autoComplete="off"
    />
  </div>
)
