interface StrokeIconProps {
  /** Path data, stroked on a 24×24 box. */
  paths: readonly string[]
  className?: string
}

/** A line icon drawn in the current text colour. Decorative. */
export const StrokeIcon = ({ paths, className }: StrokeIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
)
