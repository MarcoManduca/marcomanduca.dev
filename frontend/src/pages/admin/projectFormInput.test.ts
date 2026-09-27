import { InvalidJsonError, toProjectInput } from './projectFormInput'

const form = (fields: Record<string, string>) => {
  const data = new FormData()
  Object.entries(fields).forEach(([name, value]) => data.append(name, value))
  return data
}

const base = {
  titleIt: 'Titolo',
  titleEn: 'Title',
  mainArea: 'dl',
  context: 'academic',
  status: 'draft',
}

describe('toProjectInput', () => {
  it('reads the classification, keeping the main area first', () => {
    const input = toProjectInput(form({ ...base, secondArea: 'data' }), [])

    expect(input).toMatchObject({
      title: { it: 'Titolo', en: 'Title' },
      areas: ['dl', 'data'],
      context: 'academic',
      status: 'draft',
    })
  })

  it('reads up to three areas, each once, the main one first', () => {
    const input = toProjectInput(
      form({ ...base, secondArea: 'ml', thirdArea: 'dl' }),
      [],
    )

    expect(input.areas).toEqual(['dl', 'ml'])
  })

  it('skips the optional areas left blank', () => {
    const input = toProjectInput(
      form({ ...base, secondArea: '', thirdArea: 'data' }),
      [],
    )

    expect(input.areas).toEqual(['dl', 'data'])
  })

  it('reads the license, trimmed', () => {
    const input = toProjectInput(form({ ...base, license: ' MIT ' }), [])

    expect(input.license).toBe('MIT')
  })

  it('leaves the optional parts empty when their fields are blank', () => {
    const input = toProjectInput(form({ ...base, coverSrc: ' ' }), [])

    expect(input).toMatchObject({
      cover: null,
      metrics: [],
      topics: [],
      media: [],
      links: [],
      quest: null,
      lab: null,
    })
  })

  it('builds the cover, the links and the brief', () => {
    const input = toProjectInput(
      form({
        ...base,
        coverSrc: 'https://cdn.example.com/c.png',
        coverAltIt: 'Copertina',
        coverAltEn: 'Cover',
        'link-repo': 'https://github.com/x/y',
        'link-paper': 'https://example.com/p.pdf',
        briefObjectiveIt: 'Obiettivo',
        briefObjectiveEn: 'Objective',
      }),
      ['Python'],
    )

    expect(input.cover).toEqual({
      src: 'https://cdn.example.com/c.png',
      alt: { it: 'Copertina', en: 'Cover' },
    })
    expect(input.links).toEqual([
      { kind: 'repo', url: 'https://github.com/x/y' },
      { kind: 'paper', url: 'https://example.com/p.pdf' },
    ])
    expect(input.brief.objective).toEqual({ it: 'Obiettivo', en: 'Objective' })
    expect(input.technologies).toEqual(['Python'])
  })

  it('parses the JSON fields', () => {
    const metrics = [{ value: '15', label: { it: 'modelli', en: 'models' } }]
    const input = toProjectInput(
      form({ ...base, metrics: JSON.stringify(metrics), lab: 'null' }),
      [],
    )

    expect(input.metrics).toEqual(metrics)
    expect(input.lab).toBeNull()
  })

  it('names the JSON field that does not parse', () => {
    const read = () => toProjectInput(form({ ...base, media: '[{' }), [])

    expect(read).toThrow(InvalidJsonError)
    expect(read).toThrow(expect.objectContaining({ field: 'media' }))
  })
})
