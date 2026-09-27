import { cn } from '@/utils/cn'

export interface QuestFact {
  label: string
  value: string
  highlight?: boolean
}

interface QuestFactsProps {
  facts: QuestFact[]
  compact?: boolean
  className?: string
}

const Label = ({
  label,
  highlight,
}: Pick<QuestFact, 'label' | 'highlight'>) => (
  <dt
    className={cn(
      'mr-1.5 inline font-display font-bold uppercase tracking-wider',
      highlight ? 'text-highlight' : 'text-muted',
    )}
  >
    {label}:
  </dt>
)

/**
 * Labelled quest details, clamped to the line budget of questCardLayout.
 * Full (active quests): one row per fact, as a label column from `sm` up.
 * Compact (completed quests): first fact on its own line, the others
 * flowing below it.
 */
export const QuestFacts = ({
  facts,
  compact = false,
  className,
}: QuestFactsProps) =>
  compact ? (
    <dl
      className={cn('text-sm leading-5 text-muted sm:text-[15px]', className)}
    >
      {facts.map(({ label, value, highlight }, index) => (
        <div
          key={label}
          className={
            index === 0
              ? 'line-clamp-2 sm:line-clamp-1'
              : 'mr-4 inline-block whitespace-nowrap last:mr-0'
          }
        >
          <Label label={label} highlight={highlight} />
          <dd className="inline">{value}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <dl
      className={cn(
        'flex flex-col gap-1 text-sm leading-5 text-body sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-1.5 sm:text-[15px]',
        className,
      )}
    >
      {facts.map(({ label, value, highlight }) => (
        // Phones: label and value flow together and clamp as one block.
        <div key={label} className="line-clamp-2 sm:contents">
          <Label label={label} highlight={highlight} />
          <dd className="inline min-w-0 sm:line-clamp-1">{value}</dd>
        </div>
      ))}
    </dl>
  )
