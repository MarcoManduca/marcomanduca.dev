import { Button } from '@/components/ui/Button'

interface AdminPageHeaderProps {
  title: string
  actionLabel: string
  onAction: () => void
}

/** Page title with the primary "New …" action aligned to the right. */
export const AdminPageHeader = ({
  title,
  actionLabel,
  onAction,
}: AdminPageHeaderProps) => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-heading">{title}</h1>
    <Button onClick={onAction}>{actionLabel}</Button>
  </div>
)
