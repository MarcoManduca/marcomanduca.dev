interface TagProps {
  label: string
}

/** Small monospace pill used for technologies and article tags. */
export const Tag = ({ label }: TagProps) => (
  <span className="inline-flex items-center rounded border border-edge bg-raised px-2 py-0.5 font-mono text-xs text-body">
    {label}
  </span>
)
