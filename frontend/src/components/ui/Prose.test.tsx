import { render, screen } from '@testing-library/react'

import { Prose } from './Prose'

describe('Prose', () => {
  it('renders its children as justified, hyphenated reading text', () => {
    render(
      <Prose>
        <p>Body copy</p>
      </Prose>,
    )

    const box = screen.getByText('Body copy').parentElement
    expect(box).toHaveClass('text-justify', 'hyphens-auto')
  })

  it('merges custom classes onto the container', () => {
    render(<Prose className="mt-8">content</Prose>)

    expect(screen.getByText('content')).toHaveClass('mt-8', 'text-justify')
  })
})
