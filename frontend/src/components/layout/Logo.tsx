interface LogoProps {
  className?: string
}

/** Brand mark (overlapping triangles). Decorative — adjacent text names the link. */
export const Logo = ({ className }: LogoProps) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="200" rx="40" fill="#F4DF6D" />
    <polygon points="100,26 174,154 26,154" fill="#03728B" />
    <polygon points="100,174 26,46 174,46" fill="#F38C30" opacity="0.85" />
  </svg>
)
