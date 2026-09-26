import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { HeroPortrait } from './HeroPortrait'

describe('HeroPortrait', () => {
  it('serves the portrait only to md+ viewports via a picture source', () => {
    const { container } = renderWithProviders(<HeroPortrait />)

    const image = screen.getByRole('img', { name: 'Marco Manduca' })
    expect(image.getAttribute('src')).toMatch(/^data:image\/gif;base64,/)
    expect(image).toHaveAttribute('width', '512')
    expect(image).toHaveAttribute('height', '512')
    expect(image).toHaveAttribute('decoding', 'async')

    const source = container.querySelector('picture > source')
    expect(source).toHaveAttribute('media', '(min-width: 768px)')
    expect(source).toHaveAttribute('type', 'image/webp')
    expect(source?.getAttribute('srcset')).toMatch(/hero-512.*\.webp/)
  })
})
