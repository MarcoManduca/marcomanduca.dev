import { excerpt } from './excerpt'

describe('excerpt', () => {
  it.each([
    ['# Big-O notation', 'Big-O notation'],
    [
      'A well-known, state-of-the-art tool',
      'A well-known, state-of-the-art tool',
    ],
    ['Intro ![diagram](https://cdn.example.com/a.png) text', 'Intro text'],
    ['See [the docs](https://example.com/x-y) now', 'See the docs now'],
    ['- first\n- second\n1. third', 'first second third'],
    ['> quoted **bold** and _italic_', 'quoted bold and italic'],
    ['Use `snake_case_names` in Python', 'Use snake_case_names in Python'],
    ['Before\n\n---\n\nAfter', 'Before After'],
    ['```python\nprint(1)\n```', 'print(1)'],
    ['~~old~~ new', 'old new'],
  ])('converts %j to plain text', (markdown, expected) => {
    expect(excerpt(markdown)).toBe(expected)
  })

  it('truncates long text with an ellipsis', () => {
    expect(excerpt('word '.repeat(10), 12)).toBe('word word wo…')
  })

  it('returns short text untouched', () => {
    expect(excerpt('short', 12)).toBe('short')
  })
})
