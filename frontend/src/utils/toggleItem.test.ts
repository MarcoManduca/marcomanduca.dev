import { toggleItem } from './toggleItem'

describe('toggleItem', () => {
  it('appends a missing item', () => {
    expect(toggleItem(['aws'], 'python')).toEqual(['aws', 'python'])
  })

  it('removes a present item', () => {
    expect(toggleItem(['aws', 'python'], 'aws')).toEqual(['python'])
  })

  it('leaves the input untouched', () => {
    const items = ['aws']

    toggleItem(items, 'python')

    expect(items).toEqual(['aws'])
  })
})
