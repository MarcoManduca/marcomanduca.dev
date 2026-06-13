import { cn } from '@/utils/cn'

interface MenuToggleIconProps {
  open: boolean
}

const BAR =
  'absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-in-out'

/** Decorative hamburger icon that animates into an X when `open`. */
export const MenuToggleIcon = ({ open }: MenuToggleIconProps) => (
  <span aria-hidden="true" className="relative block h-6 w-6">
    <span
      className={cn(
        BAR,
        open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[6px]',
      )}
    />
    <span
      className={cn(BAR, 'top-1/2 -translate-y-1/2', open && 'opacity-0')}
    />
    <span
      className={cn(
        BAR,
        open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[18px]',
      )}
    />
  </span>
)
