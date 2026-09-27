import { render } from '@testing-library/react'

import { CategoryArt } from './CategoryArt'

const drawing = (category: string) =>
  render(<CategoryArt category={category} />).container.innerHTML

describe('CategoryArt', () => {
  it('draws a decorative cover, hidden from assistive tech', () => {
    const { container } = render(<CategoryArt category="data" />)

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('gives data, services and everything else a cover of their own', () => {
    const covers = new Set([
      drawing('data'),
      drawing('cloud'),
      drawing('frontend'),
    ])

    expect(covers.size).toBe(3)
  })

  it('shares the services cover between cloud and backend', () => {
    expect(drawing('backend')).toBe(drawing('cloud'))
  })

  it('falls back to the generic cover for unknown categories', () => {
    expect(drawing('quantum')).toBe(drawing('other'))
  })
})
