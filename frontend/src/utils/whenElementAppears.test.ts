import { waitFor } from '@testing-library/react'

import { whenElementAppears } from './whenElementAppears'

const addSection = () => {
  const section = document.createElement('section')
  section.id = 'lab'
  document.body.append(section)
  return section
}

describe('whenElementAppears', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('calls back right away when the element is already there', () => {
    const section = addSection()
    const onAppear = vi.fn()

    whenElementAppears('lab', onAppear, 1000)

    expect(onAppear).toHaveBeenCalledWith(section)
  })

  it('calls back once the element is rendered later', async () => {
    const onAppear = vi.fn()
    whenElementAppears('lab', onAppear, 1000)

    const section = addSection()

    await waitFor(() => expect(onAppear).toHaveBeenCalledWith(section))
  })

  it('stops waiting when cancelled', async () => {
    const onAppear = vi.fn()
    const cancel = whenElementAppears('lab', onAppear, 1000)

    cancel()
    addSection()
    await Promise.resolve()

    expect(onAppear).not.toHaveBeenCalled()
  })

  it('stops waiting after the timeout', async () => {
    vi.useFakeTimers()
    const onAppear = vi.fn()
    whenElementAppears('lab', onAppear, 1000)

    vi.advanceTimersByTime(1000)
    addSection()
    await Promise.resolve()

    expect(onAppear).not.toHaveBeenCalled()
  })
})
