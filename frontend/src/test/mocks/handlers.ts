import { HttpResponse, http } from 'msw'

import {
  articlesFixture,
  projectsFixture,
  technologiesFixture,
  versionsFixture,
} from './fixtures'

export const API_URL = 'http://localhost/api/v1'

/** The presigned S3 PUT target returned by the media presign endpoint. */
export const S3_UPLOAD_URL = 'http://localhost/s3-upload'

export const handlers = [
  // Projects — list is a bare array (no { items, total } wrapper).
  http.get(`${API_URL}/projects`, () => HttpResponse.json(projectsFixture)),
  http.get(`${API_URL}/projects/:slug`, ({ params }) => {
    const project = projectsFixture.find((p) => p.slug === params.slug)
    return project
      ? HttpResponse.json(project)
      : HttpResponse.json({ detail: 'Not found' }, { status: 404 })
  }),
  http.post(`${API_URL}/projects`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      { ...body, slug: 'new-project', created_at: '', updated_at: '' },
      { status: 201 },
    )
  }),
  http.put(`${API_URL}/projects/:slug`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...body,
      slug: params.slug,
      created_at: '',
      updated_at: '',
    })
  }),
  http.delete(
    `${API_URL}/projects/:slug`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Learning — list and versions are bare arrays.
  http.get(`${API_URL}/learning`, () => HttpResponse.json(articlesFixture)),
  http.get(`${API_URL}/learning/:slug`, ({ params }) => {
    const article = articlesFixture.find((a) => a.slug === params.slug)
    return article
      ? HttpResponse.json(article)
      : HttpResponse.json({ detail: 'Not found' }, { status: 404 })
  }),
  http.get(`${API_URL}/learning/:slug/versions`, () =>
    HttpResponse.json(versionsFixture),
  ),
  http.post(`${API_URL}/learning/:slug/rollback`, ({ params }) =>
    HttpResponse.json({ ...articlesFixture[0], slug: params.slug, version: 4 }),
  ),
  http.post(`${API_URL}/learning`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        ...body,
        slug: 'new-article',
        version: 1,
        created_at: '',
        updated_at: '',
      },
      { status: 201 },
    )
  }),
  http.put(`${API_URL}/learning/:slug`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...body,
      slug: params.slug,
      version: 2,
      created_at: '',
      updated_at: '',
    })
  }),
  http.delete(
    `${API_URL}/learning/:slug`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Technologies — bare array.
  http.get(`${API_URL}/technologies`, () =>
    HttpResponse.json(technologiesFixture),
  ),
  http.post(`${API_URL}/technologies`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      icon: string
      category: string
    }
    return HttpResponse.json(
      { id: body.name.toLowerCase(), ...body },
      { status: 201 },
    )
  }),

  // Contact — acknowledgement carries a `detail` message.
  http.post(`${API_URL}/contact`, () =>
    HttpResponse.json(
      { detail: 'Message received. Thank you!' },
      { status: 202 },
    ),
  ),

  // Media presign — { url, key, expires_in }.
  http.post(`${API_URL}/media/presign`, () =>
    HttpResponse.json({
      url: S3_UPLOAD_URL,
      key: 'images/projects/uploaded.png',
      expires_in: 900,
    }),
  ),

  // Presigned S3 PUT target (the URL the presign response points to).
  http.put(S3_UPLOAD_URL, () => new HttpResponse(null, { status: 200 })),

  // Media presigned GET URL — { url, key, expires_in }.
  http.get(`${API_URL}/media/url`, () =>
    HttpResponse.json({
      url: 'http://localhost/cv-download',
      key: 'cv/cv.pdf',
      expires_in: 900,
    }),
  ),
]
