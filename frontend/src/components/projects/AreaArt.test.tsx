import { render } from '@testing-library/react'

import type { ProjectArea } from '@/types'

import { AreaArt } from './AreaArt'

const drawing = (area: ProjectArea) =>
  render(<AreaArt area={area} />).container.innerHTML

describe('AreaArt', () => {
  it('draws a decorative cover, hidden from assistive tech', () => {
    const { container } = render(<AreaArt area="data" />)

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

  it('gives the other areas the generic cover', () => {
    expect(drawing('dl')).toBe(drawing('frontend'))
  })
})
