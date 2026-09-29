/**
 * The CloudFront viewer-request functions, run in a VM context the way the
 * edge runs them (plain script, `cloudfront` module replaced by a fake).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

import { describe, expect, it } from 'vitest'

import { routeFile } from './routes.mjs'

const FUNCTIONS = resolve(
  import.meta.dirname,
  '../../../infra/terraform/modules/cdn/functions',
)
const IMPORT = "import cf from 'cloudfront';"

/** Load a function file; `kvs` stands in for the associated key value store. */
const loadHandler = (file, kvs) => {
  const code = readFileSync(resolve(FUNCTIONS, file), 'utf8')
  const context = { cf: { kvs: () => kvs } }
  runInNewContext(code.replace(IMPORT, ''), context)
  return context.handler
}

const storeWith = (...keys) => ({ exists: async (key) => keys.includes(key) })
const brokenStore = {
  exists: async () => Promise.reject(new Error('kvs down')),
}

const viewerRequest = ({
  uri,
  host = 'marcomanduca.dev',
  querystring = {},
}) => ({
  request: {
    method: 'GET',
    uri,
    headers: { host: { value: host } },
    querystring,
  },
})

describe('site_viewer_request.js', () => {
  it('imports the cloudfront module first, as the edge requires', () => {
    const code = readFileSync(
      resolve(FUNCTIONS, 'site_viewer_request.js'),
      'utf8',
    )

    expect(code.startsWith(IMPORT)).toBe(true)
  })

  it('serves the pre-rendered page of a listed route', async () => {
    const handler = loadHandler(
      'site_viewer_request.js',
      storeWith('/projects/deep-layers'),
    )

    const result = await handler(
      viewerRequest({ uri: '/projects/deep-layers' }),
    )

    expect(result.uri).toBe(`/${routeFile('/projects/deep-layers')}`)
  })

  it('serves the pre-rendered home page', async () => {
    const handler = loadHandler('site_viewer_request.js', storeWith('/'))

    const result = await handler(viewerRequest({ uri: '/' }))

    expect(result.uri).toBe(`/${routeFile('/')}`)
  })

  it('falls back to the SPA shell for an unlisted route', async () => {
    const handler = loadHandler(
      'site_viewer_request.js',
      storeWith('/projects/other'),
    )

    const result = await handler(viewerRequest({ uri: '/projects/new-one' }))

    expect(result.uri).toBe('/index.html')
  })

  it('falls back to the SPA shell when the key value store fails', async () => {
    const handler = loadHandler('site_viewer_request.js', brokenStore)

    const result = await handler(viewerRequest({ uri: '/about-me' }))

    expect(result.uri).toBe('/index.html')
  })

  it.each([
    '/assets/index-1a2b.js',
    '/robots.txt',
    '/images/projects/a/cover.webp',
  ])('leaves the file path %s untouched', async (uri) => {
    const handler = loadHandler('site_viewer_request.js', storeWith())

    const result = await handler(viewerRequest({ uri }))

    expect(result.uri).toBe(uri)
  })

  it('redirects www to the apex, keeping the path and every query value', async () => {
    const handler = loadHandler('site_viewer_request.js', storeWith())
    const querystring = {
      tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] },
      x: { value: '' },
    }

    const result = await handler(
      viewerRequest({
        uri: '/learning',
        host: 'www.marcomanduca.dev',
        querystring,
      }),
    )

    expect(result.statusCode).toBe(301)
    expect(result.headers.location.value).toBe(
      'https://marcomanduca.dev/learning?tag=a&tag=b&x',
    )
  })

  it('drops a trailing slash with a redirect, keeping the query string', async () => {
    const handler = loadHandler(
      'site_viewer_request.js',
      storeWith('/projects'),
    )

    const result = await handler(
      viewerRequest({
        uri: '/projects//',
        querystring: { area: { value: 'data' } },
      }),
    )

    expect(result.statusCode).toBe(301)
    expect(result.headers.location.value).toBe(
      'https://marcomanduca.dev/projects?area=data',
    )
  })
})

describe('media_viewer_request.js', () => {
  it('maps /media/images/* to the images/* bucket key', () => {
    const handler = loadHandler('media_viewer_request.js')

    const result = handler(
      viewerRequest({ uri: '/media/images/projects/1a2b-cover.png' }),
    )

    expect(result.uri).toBe('/images/projects/1a2b-cover.png')
  })
})
