import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { AboutMe } from './AboutMe'

/** Viewport top (px) of each timeline entry; the others sit far below. */
const placeEntries = (tops: Record<string, number>) =>
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return { top: tops[this.id] ?? 10_000 } as DOMRect
    })

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  fireEvent.scroll(window)
}

const currentEntry = () =>
  screen
    .getAllByRole('listitem')
    .filter((entry) => entry.getAttribute('aria-current') === 'location')

describe('AboutMe', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('renders the bio, experience, education and skill sections', () => {
    renderWithProviders(<AboutMe />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'About me' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Experience' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Education' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeInTheDocument()
  })

  it('lists experience, education and individual skills', () => {
    renderWithProviders(<AboutMe />)

    expect(screen.getByText('November 2020 — Present')).toBeInTheDocument()
    expect(screen.getByText('MSc in Data Science')).toBeInTheDocument()
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0)
    expect(screen.getByText('Power BI')).toBeInTheDocument()
  })

  it('gives every timeline entry an anchor for the home quests', () => {
    renderWithProviders(<AboutMe />)

    expect(document.getElementById('work-2020-11')).toHaveTextContent(
      'Business Data Analyst',
    )
    expect(document.getElementById('study-2015-09')).toHaveTextContent(
      'BSc in Statistics',
    )
  })

  it('marks the entry the URL points at as the current location', () => {
    renderWithProviders(<AboutMe />, { route: '/about-me#study-2015-09' })

    expect(currentEntry()).toHaveLength(1)
    expect(currentEntry()[0]).toHaveTextContent('BSc in Statistics')
  })

  it('highlights the entry crossing the reading line as the reader scrolls', () => {
    // jsdom viewport: 768px tall, so the reading line sits at ~269px.
    placeEntries({ 'work-2020-11': 900 })
    renderWithProviders(<AboutMe />)
    expect(currentEntry()).toHaveLength(0)

    placeEntries({ 'work-2020-11': -300, 'work-2019-09': 120 })
    scrollTo(700)
    expect(currentEntry()[0]).toHaveTextContent(
      'Business Intelligence Consultant',
    )

    placeEntries({
      'work-2020-11': -900,
      'work-2019-09': -400,
      'study-2025-09': 250,
    })
    scrollTo(1300)
    expect(currentEntry()[0]).toHaveTextContent('MSc in Data Science')
  })

  it('keeps the linked entry highlighted until the reader scrolls away', () => {
    placeEntries({ 'work-2020-11': 100 })
    renderWithProviders(<AboutMe />, { route: '/about-me#study-2015-09' })

    fireEvent.scroll(window)
    expect(currentEntry()[0]).toHaveTextContent('BSc in Statistics')

    scrollTo(40)
    expect(currentEntry()[0]).toHaveTextContent('Business Data Analyst')
  })

  it('renders the CV download button', () => {
    renderWithProviders(<AboutMe />)

    expect(
      screen.getByRole('button', { name: 'Download CV' }),
    ).toBeInTheDocument()
  })
})
