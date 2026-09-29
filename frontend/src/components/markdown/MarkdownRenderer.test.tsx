import { render, screen } from '@testing-library/react'

import { markdownHeadings } from '@/utils/markdownHeadings'

import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders headings and paragraphs', async () => {
    render(<MarkdownRenderer content={'# Title\n\nSome paragraph.'} />)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Title' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Some paragraph.')).toBeInTheDocument()
  })

  it('gives second-level headings the anchor id of their text', async () => {
    render(<MarkdownRenderer content={'## Il *problema*\n\nText.'} />)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Il problema' }),
    ).toHaveAttribute('id', 'il-problema')
  })

  it('renders exactly the heading ids the table of contents links to', async () => {
    const markdown = [
      '## The load_data step',
      '## Using [dbt](https://getdbt.com)',
      '## Calling `fit()` with $O(n)$',
      '## Results',
      '## Results',
    ].join('\n\n')
    const { container } = render(<MarkdownRenderer content={markdown} />)
    await screen.findByText('The load_data step')

    // Plain DOM query: jsdom cannot compute accessible names over KaTeX MathML.
    const rendered = Array.from(
      container.querySelectorAll('h2'),
      ({ id }) => id,
    )

    expect(rendered).toEqual(markdownHeadings(markdown).map(({ id }) => id))
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
    expect(code).toHaveClass('hljs', 'language-python')
    expect(container.querySelector('.hljs-keyword')).not.toBeNull()
  })

  it('highlights a language through its alias', async () => {
    const { container } = render(
      <MarkdownRenderer content={'```ts\nconst answer: number = 42\n```'} />,
    )

    await screen.findByText(/answer/)
    expect(container.querySelector('.hljs-keyword')).not.toBeNull()
  })

  it('keeps a block in an unregistered language as plain text', async () => {
    const { container } = render(
      <MarkdownRenderer content={'```hcl\nresource "x" "y" {}\n```'} />,
    )

    await screen.findByText(/resource/)
    expect(container.querySelector('pre code')).toHaveClass(
      'hljs',
      'language-hcl',
    )
    expect(container.querySelector('[class^="hljs-"]')).toBeNull()
  })

  it('leaves a block without a language untouched', async () => {
    const { container } = render(
      <MarkdownRenderer content={'```\nplain text\n```'} />,
    )

    await screen.findByText(/plain text/)
    expect(container.querySelector('pre code')).not.toHaveClass('hljs')
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
