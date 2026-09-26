import { cn } from '@/utils/cn'

export interface QuestFact {
  label: string
  value: string
  highlight?: boolean
}

interface QuestFactsProps {
  facts: QuestFact[]
  compact?: boolean
}

/**
 * Labelled quest details. Full (active quests): one row per fact, as a
 * label column from `sm` up. Compact (completed quests): first fact on its
 * own line, the others flowing below it.
 */
export const QuestFacts = ({ facts, compact = false }: QuestFactsProps) => (
  <dl
    className={cn(
      'text-sm sm:text-[15px]',
      compact
        ? 'flex flex-wrap gap-x-4 gap-y-0.5 text-muted'
        : 'flex flex-col gap-1 text-body sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3',
    )}
  >
    {facts.map(({ label, value, highlight }, index) => (
      <div
        key={label}
        className={cn(
          compact ? 'flex gap-1.5' : 'sm:contents',
          // Completed quests: guild on its own line, dates below.
          compact && index === 0 && 'w-full',
        )}
      >
        <dt
          className={cn(
            'mr-1.5 inline font-display font-bold uppercase tracking-wider sm:mr-0',
            highlight ? 'text-highlight' : 'text-muted',
          )}
        >
          {label}:
        </dt>
        <dd className="inline min-w-0">{value}</dd>
      </div>
    ))}
  </dl>
)
