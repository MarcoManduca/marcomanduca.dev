import type { CvContent } from '@/types'

interface CvContentViewProps {
  content: CvContent
}

const isRecord = (value: unknown): value is Record<string, CvContent> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Render a CV section's localized content, which the backend stores as
 * arbitrary JSON: a plain string, a list of entries, or a nested object.
 */
export const CvContentView = ({ content }: CvContentViewProps) => {
  if (content === null || content === undefined) return null

  if (typeof content === 'string' || typeof content === 'number') {
    return <p className="text-sm leading-relaxed">{String(content)}</p>
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-3">
        {content.map((entry, index) => (
          <li key={index} className="rounded-lg border border-edge p-4">
            <CvContentView content={entry} />
          </li>
        ))}
      </ul>
    )
  }

  if (isRecord(content)) {
    return (
      <dl className="space-y-1">
        {Object.entries(content).map(([field, value]) => (
          <div key={field} className="flex flex-col gap-0.5">
            <dt className="font-mono text-xs uppercase text-muted">{field}</dt>
            <dd>
              <CvContentView content={value} />
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return null
}
