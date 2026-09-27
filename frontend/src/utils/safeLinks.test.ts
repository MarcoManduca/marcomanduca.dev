import type { ProjectLink } from '@/types'

import { leadLinks, safeLinks } from './safeLinks'

const repo: ProjectLink = { kind: 'repo', url: 'https://github.com/a/b' }
const live: ProjectLink = { kind: 'live', url: 'https://example.com' }
const paper: ProjectLink = { kind: 'paper', url: 'https://example.com/a.pdf' }

describe('safeLinks', () => {
  it('drops links without an http(s) URL', () => {
    const unsafe: ProjectLink = { kind: 'docs', url: 'javascript:alert(1)' }

    expect(safeLinks([repo, unsafe])).toEqual([repo])
  })
})

describe('leadLinks', () => {
  it('puts a live site before the code, then the rest', () => {
    expect(leadLinks([paper, repo, live], 2)).toEqual([live, repo])
  })

  it('keeps one link per kind', () => {
    const fork: ProjectLink = { kind: 'repo', url: 'https://github.com/a/c' }

    expect(leadLinks([repo, fork, paper], 2)).toEqual([repo, paper])
  })
})
