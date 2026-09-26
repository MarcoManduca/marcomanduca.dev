import { cn } from '@/utils/cn'

interface EnergyCardProps {
  icon: string
  iconClassName: string
  title: string
  skills: string[]
}

/** One skill group, styled as a card "energy" with a coloured token. */
export const EnergyCard = ({
  icon,
  iconClassName,
  title,
  skills,
}: EnergyCardProps) => (
  <li className="flex items-center gap-3.5 rounded-2xl bg-surface p-4">
    <span
      aria-hidden="true"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold',
        iconClassName,
      )}
    >
      {icon}
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="font-display text-lg font-bold uppercase text-heading">
        {title}
      </span>
      <span className="text-sm">{skills.join(' · ')}</span>
    </span>
  </li>
)
