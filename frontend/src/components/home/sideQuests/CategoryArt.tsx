const ART_PROPS = {
  viewBox: '0 0 296 120',
  fill: 'none',
  'aria-hidden': true,
  className: 'h-full w-full',
} as const

/** Data: a partial order of nodes, one chain lit through it. */
const GraphArt = () => (
  <svg {...ART_PROPS}>
    <g strokeWidth={2} className="stroke-edge">
      <path d="M148 16 98 44M148 16l50 28M98 44 60 74M198 44l-50 30M198 44l38 30M60 74l44 30M148 74l-44 30M236 74l-44 30" />
    </g>
    <path
      d="M148 16 98 44l50 30 44 30"
      strokeWidth={2.5}
      className="stroke-accent"
    />
    <g strokeWidth={2} className="fill-surface stroke-accent">
      {[
        [98, 44],
        [198, 44],
        [60, 74],
        [148, 74],
        [236, 74],
        [104, 104],
        [192, 104],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={6} />
      ))}
    </g>
    <circle
      cx={148}
      cy={16}
      r={7}
      strokeWidth={2}
      className="fill-highlight stroke-background"
    />
  </svg>
)

/** Cloud and backend: services wired left to right, one of them lit. */
const FlowArt = () => (
  <svg {...ART_PROPS}>
    <g strokeWidth={1.5} strokeLinecap="round" className="stroke-muted">
      <path d="M66 38h12M150 38h12M222 38h12M114 52v26M192 52v26" />
    </g>
    <g className="fill-muted">
      <path d="m80 38-5-3v6zM164 38l-5-3v6zM236 38l-5-3v6zM114 80l-3-5h6zM192 80l-3-5h6z" />
    </g>
    <g strokeWidth={1.5} className="fill-surface stroke-edge">
      <rect x={6} y={24} width={58} height={28} rx={6} />
      <rect x={80} y={24} width={68} height={28} rx={6} />
      <rect x={164} y={24} width={56} height={28} rx={6} />
      <rect x={236} y={24} width={54} height={28} rx={6} />
      <rect x={84} y={80} width={60} height={28} rx={6} />
      <rect x={156} y={80} width={72} height={28} rx={6} />
    </g>
    <rect
      x={164}
      y={24}
      width={56}
      height={28}
      rx={6}
      strokeWidth={2}
      className="stroke-accent"
    />
    <g strokeWidth={3} strokeLinecap="round" className="stroke-edge">
      <path d="M20 38h30M96 38h36M178 38h28M250 38h26M98 94h32M170 94h44" />
    </g>
  </svg>
)

/** Anything else: contour lines, like the page background. */
export const ContourArt = () => (
  <svg {...ART_PROPS} preserveAspectRatio="xMidYMid slice">
    <g strokeWidth={1.5} className="stroke-edge">
      <path d="M180 10c70-12 110 30 96 62s-80 50-120 30-50-86 24-92Z" />
      <path d="M186 30c46-8 72 20 62 42s-54 32-80 20-34-56 18-62Z" />
      <path d="M192 50c22-4 36 10 30 22s-26 16-40 10-16-28 10-32Z" />
      <path d="M-10 96c60-30 120 20 180 0s110-18 136 6" />
    </g>
  </svg>
)

interface CategoryArtProps {
  category: string
}

/** Cover of a project that has no images yet, drawn for its category. */
export const CategoryArt = ({ category }: CategoryArtProps) => {
  if (category === 'data') return <GraphArt />
  if (category === 'cloud' || category === 'backend') return <FlowArt />
  return <ContourArt />
}
