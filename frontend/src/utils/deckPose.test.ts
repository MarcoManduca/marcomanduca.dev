import { deckPose, dragPose, throwPose } from './deckPose'

describe('deckPose', () => {
  it('rests the top card flat and fully lit', () => {
    expect(deckPose(0)).toEqual({
      transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
      filter: 'brightness(1)',
      hidden: false,
    })
  })

  it('fans the cards below out to the right, smaller and darker', () => {
    expect(deckPose(2)).toEqual({
      transform: 'translate(46px, 20px) rotate(8deg) scale(0.9)',
      filter: 'brightness(0.4)',
      hidden: false,
    })
  })

  it('blends two poses at a fractional depth', () => {
    expect(deckPose(0.5)).toEqual({
      transform: 'translate(12px, 5px) rotate(2deg) scale(0.975)',
      filter: 'brightness(0.8)',
      hidden: false,
    })
  })

  it('hides the cards past the last pose behind it', () => {
    expect(deckPose(4)).toEqual({ ...deckPose(2), hidden: true })
  })
})

describe('dragPose', () => {
  it('follows the drag and tilts toward it', () => {
    expect(dragPose(-36)).toBe('translate(-36px, 1.8px) rotate(-2deg)')
  })
})

describe('throwPose', () => {
  it('throws the card off the side it was dragged to', () => {
    expect(throwPose(1)).toBe('translate(640px, 40px) rotate(24deg)')
    expect(throwPose(-1)).toBe('translate(-640px, 40px) rotate(-24deg)')
  })
})
