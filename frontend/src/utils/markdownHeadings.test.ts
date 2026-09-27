import { markdownHeadings } from './markdownHeadings'

describe('markdownHeadings', () => {
  it('lists the second-level headings with their anchor ids', () => {
    const markdown =
      '# Title\n\n## Il problema\n\nText\n\n## **Approccio** ##\n'

    expect(markdownHeadings(markdown)).toEqual([
      { id: 'il-problema', text: 'Il problema' },
      { id: 'approccio', text: 'Approccio' },
    ])
  })

  it('skips deeper headings and lines inside fenced code', () => {
    const markdown = '### Detail\n\n```md\n## Not a heading\n```\n\n## Results'

    expect(markdownHeadings(markdown)).toEqual([
      { id: 'results', text: 'Results' },
    ])
  })
})
