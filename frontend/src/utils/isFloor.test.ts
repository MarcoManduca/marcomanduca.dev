import { isFloor, isFloorAt } from './isFloor'

/** Mounts `html` and returns the element with id `target`. */
const mount = (html: string) => {
  document.body.innerHTML = html
  return document.getElementById('target')
}

describe('isFloor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('treats empty layout boxes as the floor', () => {
    const target = mount('<main><div><div id="target"></div></div></main>')

    expect(isFloor(target)).toBe(true)
  })

  it('treats a see-through background as the floor', () => {
    const target = mount(
      '<div style="background-color: rgba(0, 0, 0, 0)"><div id="target"></div></div>',
    )

    expect(isFloor(target)).toBe(true)
  })

  it.each([
    ['text', '<h2 id="target">Stats</h2>'],
    ['a link', '<a href="/"><span id="target"></span></a>'],
    ['a button', '<button><span id="target"></span></button>'],
    ['a drawing', '<svg><path id="target"></path></svg>'],
    [
      'a card',
      '<div style="background-color: rgb(20, 40, 50)"><div id="target"></div></div>',
    ],
    [
      'a gradient',
      '<div style="background-image: url(frame.png)"><div id="target"></div></div>',
    ],
    [
      'a bordered panel',
      '<div style="border: 2px dashed"><div id="target"></div></div>',
    ],
  ])('keeps %s off the floor', (_content, html) => {
    expect(isFloor(mount(html))).toBe(false)
  })

  it('needs an element to stand on', () => {
    expect(isFloor(null)).toBe(false)
    expect(isFloor(window)).toBe(false)
  })
})

describe('isFloorAt', () => {
  afterEach(() => {
    vi.mocked(document.elementFromPoint).mockReset()
    document.body.innerHTML = ''
  })

  it('checks whatever is drawn at the point', () => {
    const floor = mount('<div id="target"></div>')
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    expect(isFloorAt({ x: 10, y: 20 })).toBe(true)
    expect(document.elementFromPoint).toHaveBeenCalledWith(10, 20)
  })

  it('finds no floor where nothing is drawn', () => {
    vi.mocked(document.elementFromPoint).mockReturnValue(null)

    expect(isFloorAt({ x: 10, y: 20 })).toBe(false)
  })
})
