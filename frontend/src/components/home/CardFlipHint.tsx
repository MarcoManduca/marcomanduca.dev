/**
 * Faint circular arrow peeking out from behind the top-left corner; it turns
 * half a circle while the pointer is over the card (the parent `group`).
 */
export const CardFlipHint = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="absolute -left-[7px] -top-[14px] h-8 w-8 text-heading/5 transition-transform duration-500 motion-safe:group-hover:rotate-180"
  >
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v5h-5" />
  </svg>
)
