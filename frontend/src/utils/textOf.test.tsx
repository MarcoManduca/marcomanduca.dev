import { textOf } from './textOf'

describe('textOf', () => {
  it('joins the text of nested children', () => {
    const children = ['Signals and ', <strong key="s">evaluation</strong>, 2]

    expect(textOf(children)).toBe('Signals and evaluation2')
  })

  it('ignores empty and boolean children', () => {
    expect(textOf([null, false, undefined])).toBe('')
  })
})
