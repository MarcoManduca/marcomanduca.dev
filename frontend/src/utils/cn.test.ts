import { cn } from './cn'

describe('cn', () => {
  it('joins multiple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('skips falsy conditional values', () => {
    const isHidden = false
    expect(cn('base', isHidden && 'hidden', undefined, null)).toBe('base')
  })

  it('resolves tailwind conflicts keeping the last class', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('merges object and array syntax', () => {
    expect(cn(['text-sm', { 'font-bold': true, italic: false }])).toBe(
      'text-sm font-bold',
    )
  })
})
