import { render, screen } from '@testing-library/react'

import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders headings and paragraphs', () => {
    render(<MarkdownRenderer content={'# Title\n\nSome paragraph.'} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Title' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Some paragraph.')).toBeInTheDocument()
  })

  it('renders a highlighted code block', () => {
    const { container } = render(
      <MarkdownRenderer
        content={'```python\ndef hello():\n    return 42\n```'}
      />,
    )

    const code = container.querySelector('pre code')
    expect(code).not.toBeNull()
    expect(code).toHaveClass('language-python')
    expect(container.querySelector('.hljs-keyword')).not.toBeNull()
  })

  it('renders LaTeX math with KaTeX', () => {
    const { container } = render(
      <MarkdownRenderer content={'Euler: $e^{i\\pi} + 1 = 0$'} />,
    )

    expect(container.querySelector('.katex')).not.toBeNull()
  })
})
