interface LogoProps {
  className?: string
}

/** Brand mark. Decorative — adjacent text names the link. */
export const Logo = ({ className }: LogoProps) => (
  <img src="/logo/color.svg" alt="" aria-hidden="true" className={className} />
)
