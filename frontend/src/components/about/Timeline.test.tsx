import { act, fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Timeline } from './Timeline'

const ENTRIES = [
  { start: '2024-01', title: 'Newest' },
  { start: '2022-01', title: 'Middle' },
  { start: '2020-01', title: 'Oldest' },
]

/** Segment length (px) between two dots, in every test. */
const SEGMENT = 400

/**
 * Viewport top (px) of each entry, the others far below. jsdom's viewport
 * is 768px tall, so the reading line sits at ~269px.
 */
const placeEntries = (tops: Record<string, number>) =>
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return { top: tops[this.id] ?? 10_000, height: SEGMENT } as DOMRect
    })

const renderTimeline = (activeAnchor: string | null = null) =>
  renderWithProviders(
    <Timeline kind="work" entries={ENTRIES} activeAnchor={activeAnchor}>
      {({ title }) => <h3>{title}</h3>}
    </Timeline>,
  )

const entry = (title: string) =>
  screen.getByRole('heading', { name: title }).closest('li')!

/** The lit part of the rail leading from an entry to the next one. */
const fillOf = (title: string) =>
  entry(title).querySelector('span[aria-hidden="true"] > span')

describe('Timeline', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('puts each entry in a card, anchored for the home quests', () => {
    renderTimeline()

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(entry('Middle')).toHaveAttribute('id', 'work-2022-01')
    expect(entry('Middle')).not.toHaveAttribute('aria-current')
  })

  it('marks the active entry as the current location', () => {
    renderTimeline('work-2022-01')

    expect(entry('Middle')).toHaveAttribute('aria-current', 'location')
    expect(entry('Newest')).not.toHaveAttribute('aria-current')
  })

  it('draws a rail segment towards every entry but the last', () => {
    renderTimeline()

    expect(fillOf('Newest')).toBeInTheDocument()
    expect(fillOf('Middle')).toBeInTheDocument()
    expect(fillOf('Oldest')).not.toBeInTheDocument()
  })

  it('lights the segment as the reading line moves towards the next entry', () => {
    placeEntries({ 'work-2024-01': 500 })
    renderTimeline()
    expect(fillOf('Newest')).toHaveStyle({ transform: 'scaleY(0)' })

    placeEntries({ 'work-2024-01': 68.8 })
    fireEvent.scroll(window)
    expect(fillOf('Newest')).toHaveStyle({ transform: 'scaleY(0.5)' })

    placeEntries({ 'work-2024-01': -500, 'work-2022-01': -31.2 })
    fireEvent.scroll(window)
    expect(fillOf('Newest')).toHaveStyle({ transform: 'scaleY(1)' })
    expect(fillOf('Middle')).toHaveStyle({ transform: 'scaleY(0.75)' })
  })

  it('fills the rail up to an active entry the reading line never reached', () => {
    placeEntries({})
    renderTimeline('work-2020-01')

    expect(fillOf('Newest')).toHaveStyle({ transform: 'scaleY(1)' })
    expect(fillOf('Middle')).toHaveStyle({ transform: 'scaleY(1)' })
  })

  it('follows the entries when the page reflows without scrolling', () => {
    const observers: (() => void)[] = []
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          observers.push(callback)
        }
        observe() {}
        disconnect() {}
      },
    )
    placeEntries({ 'work-2024-01': 500 })
    renderTimeline()

    placeEntries({ 'work-2024-01': 168.8 })
    act(() => observers.forEach((reflow) => reflow()))

    expect(fillOf('Newest')).toHaveStyle({ transform: 'scaleY(0.25)' })
  })
})
