import { render, screen } from '@testing-library/react'

import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders headings and paragraphs', async () => {
    render(<MarkdownRenderer content={'# Title\n\nSome paragraph.'} />)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Title' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Some paragraph.')).toBeInTheDocument()
  })

  it('renders a highlighted code block', async () => {
    const { container } = render(
      <MarkdownRenderer
        content={'```python\ndef hello():\n    return 42\n```'}
      />,
    )

    await screen.findByText(/def/)
    const code = container.querySelector('pre code')
    expect(code).not.toBeNull()
    expect(code).toHaveClass('language-python')
    expect(container.querySelector('.hljs-keyword')).not.toBeNull()
  })

  it('renders LaTeX math with KaTeX', async () => {
    const { container } = render(
      <MarkdownRenderer content={'Euler: $e^{i\\pi} + 1 = 0$'} />,
    )

    await screen.findByText(/Euler/)
    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('does not render raw HTML embedded in the markdown', async () => {
    const { container } = render(
      <MarkdownRenderer
        content={
          'Hello <script>window.x=1</script><img src=x onerror=alert(1)>'
        }
      />,
    )

    await screen.findByText(/Hello/)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('neutralizes javascript: links', async () => {
    const { container } = render(
      <MarkdownRenderer content={'[click](javascript:alert(1))'} />,
    )

    await screen.findByText('click')
    const link = container.querySelector('a')
    expect(link?.getAttribute('href') ?? '').not.toContain('javascript:')
  })
})
