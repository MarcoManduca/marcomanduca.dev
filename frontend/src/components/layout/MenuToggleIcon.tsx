import { cn } from '@/utils/cn'

interface MenuToggleIconProps {
  open: boolean
}

const BAR =
  'absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-in-out'

/**
 * Decorative hamburger icon that animates into an X when `open`. The 2px bars
 * sit 6px apart, centred in the 24px box (top 5, 11 and 17px); open, the outer
 * two meet on the middle one and cross.
 */
export const MenuToggleIcon = ({ open }: MenuToggleIconProps) => (
  <span aria-hidden="true" className="relative block h-6 w-6">
    <span className={cn(BAR, open ? 'top-[11px] rotate-45' : 'top-[5px]')} />
    <span className={cn(BAR, 'top-[11px]', open && 'opacity-0')} />
    <span className={cn(BAR, open ? 'top-[11px] -rotate-45' : 'top-[17px]')} />
  </span>
)
