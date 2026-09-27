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

  it('keeps intraword underscores and inline code text in the id', () => {
    const markdown = '## The load_data step\n\n## Calling `fit()`'

    expect(markdownHeadings(markdown)).toEqual([
      { id: 'the-load-data-step', text: 'The load_data step' },
      { id: 'calling-fit', text: 'Calling fit()' },
    ])
  })

  it('uses the link text, not the link syntax, for text and id', () => {
    const markdown = '## Using [dbt](https://getdbt.com) models'

    expect(markdownHeadings(markdown)).toEqual([
      { id: 'using-dbt-models', text: 'Using dbt models' },
    ])
  })

  it('suffixes repeated headings so every id stays unique', () => {
    const markdown = '## Results\n\n## Results\n\n## Results 2'

    expect(markdownHeadings(markdown).map(({ id }) => id)).toEqual([
      'results',
      'results-2',
      'results-2-2',
    ])
  })

  it('falls back to a generic id when no letter or digit is left', () => {
    expect(markdownHeadings('## ???')).toEqual([{ id: 'section', text: '???' }])
  })
})
