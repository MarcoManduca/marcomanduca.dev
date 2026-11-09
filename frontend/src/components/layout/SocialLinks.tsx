import profile from '@/data/profile.json'
import { cn } from '@/utils/cn'

/** Public profiles, in display order (URLs live in `src/data/profile.json`). */
const SOCIAL_LINKS = [
  { label: 'GitHub', href: profile.links.github },
  { label: 'LinkedIn', href: profile.links.linkedin },
] as const

interface SocialLinksProps {
  className?: string
  linkClassName?: string
}

/** The profile's public channels, each opened in a new, isolated tab. */
export const SocialLinks = ({ className, linkClassName }: SocialLinksProps) => (
  <ul className={cn('flex flex-wrap gap-x-5 gap-y-2', className)}>
    {SOCIAL_LINKS.map(({ label, href }) => (
      <li key={label}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {label} ↗
        </a>
      </li>
    ))}
  </ul>
)
