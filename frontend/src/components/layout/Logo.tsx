interface LogoProps {
  className?: string
}

/** Brand mark (network graph). Decorative — the adjacent text names the link. */
export const Logo = ({ className }: LogoProps) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="200" rx="36" fill="#0f172a" />
    <g stroke="#1e3a8a" strokeWidth="3">
      <line x1="50" y1="54" x2="110" y2="40" />
      <line x1="50" y1="54" x2="44" y2="122" />
      <line x1="110" y1="40" x2="152" y2="92" />
      <line x1="44" y1="122" x2="152" y2="92" />
      <line x1="152" y1="92" x2="86" y2="154" />
      <line x1="44" y1="122" x2="86" y2="154" />
    </g>
    <g stroke="#1e40af" strokeWidth="2.5">
      <line x1="44" y1="122" x2="110" y2="40" />
      <line x1="110" y1="40" x2="86" y2="154" />
    </g>
    <circle
      cx="50"
      cy="54"
      r="14"
      fill="#1e40af"
      stroke="#3b82f6"
      strokeWidth="3"
    />
    <circle
      cx="110"
      cy="40"
      r="20"
      fill="#3b82f6"
      stroke="#60a5fa"
      strokeWidth="3"
    />
    <circle
      cx="152"
      cy="92"
      r="11"
      fill="#1e40af"
      stroke="#3b82f6"
      strokeWidth="3"
    />
    <circle
      cx="44"
      cy="122"
      r="11"
      fill="#1e40af"
      stroke="#3b82f6"
      strokeWidth="3"
    />
    <circle
      cx="86"
      cy="154"
      r="14"
      fill="#2563eb"
      stroke="#60a5fa"
      strokeWidth="3"
    />
  </svg>
)
