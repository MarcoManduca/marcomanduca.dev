import { headingId } from './headingId'

describe('headingId', () => {
  it.each([
    ['Il problema', 'il-problema'],
    ['Segnali e valutazione', 'segnali-e-valutazione'],
    ['Qualità & test', 'qualita-test'],
    ['  RGB → IR  ', 'rgb-ir'],
  ])('turns %j into %j', (text, id) => {
    expect(headingId(text)).toBe(id)
  })
})
