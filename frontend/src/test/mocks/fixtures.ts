import type {
  ArticleVersion,
  LearningArticle,
  Project,
  ProjectLab,
  ProjectSummary,
  Technology,
} from '@/types'

const brief = (topic: string) => ({
  objective: { it: `Obiettivo: ${topic}`, en: `Objective: ${topic}` },
  boss: { it: 'Il limite dei costi', en: 'The cost ceiling' },
  rewards: { it: 'Una pipeline pronta', en: 'A ready pipeline' },
})

export const projectsFixture: Project[] = [
  {
    slug: 'data-pipeline',
    title: { it: 'Pipeline dati', en: 'Data pipeline' },
    description: {
      it: 'Una pipeline ETL serverless.',
      en: 'A serverless ETL pipeline.',
    },
    areas: ['data', 'cloud'],
    context: 'work',
    cover: {
      src: 'https://cdn.example.com/p1.png',
      alt: { it: 'Schema della pipeline', en: 'Pipeline diagram' },
    },
    metrics: [{ value: '3', label: { it: 'servizi', en: 'services' } }],
    technologies: ['Python', 'AWS'],
    brief: brief('ETL'),
    content_markdown: {
      it: '## Come funziona\n\nContenuto in italiano.\n\n## Risultati\n\nPiù veloce.',
      en: '## How it works\n\nBuilt with **AWS Lambda** and Step Functions.\n\n## Results\n\nFaster.',
    },
    topics: [{ it: 'dati', en: 'data' }],
    media: [
      {
        src: 'https://cdn.example.com/p1.png',
        alt: { it: 'Schema della pipeline', en: 'Pipeline diagram' },
        caption: { it: 'Il flusso dei dati', en: 'How the data flows' },
      },
    ],
    links: [
      { kind: 'repo', url: 'https://github.com/example/data-pipeline' },
      { kind: 'paper', url: 'https://example.com/pipeline.pdf' },
    ],
    license: 'MIT',
    quest: 'work-2020-11',
    lab: null,
    status: 'published',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
  {
    slug: 'portfolio-site',
    title: { it: 'Sito portfolio', en: 'Portfolio site' },
    description: {
      it: 'Questo sito, costruito con React.',
      en: 'This very site, built with React.',
    },
    areas: ['frontend'],
    context: 'personal',
    cover: null,
    metrics: [],
    technologies: ['React', 'TypeScript'],
    brief: brief('portfolio'),
    content_markdown: { it: 'Contenuto.', en: 'Content.' },
    topics: [],
    media: [],
    links: [
      { kind: 'repo', url: 'https://github.com/example/portfolio-site' },
      { kind: 'live', url: 'https://marcomanduca.dev' },
    ],
    license: 'GPL-3.0 · CC BY-SA 4.0',
    quest: null,
    lab: null,
    status: 'published',
    created_at: '2026-03-05T09:00:00Z',
    updated_at: '2026-03-06T09:00:00Z',
  },
]

const image = (name: string) => ({
  src: `/images/projects/lab/${name}.webp`,
  alt: { it: `Immagine ${name}`, en: `Image ${name}` },
})

const layer = (id: string, label: string) => ({
  id,
  label: { it: label, en: label },
  ...image(id),
  description: { it: `Come leggere ${label}`, en: `How to read ${label}` },
})

/** A lab with two samples; only the first one has a residual layer. */
export const labFixture: ProjectLab = {
  kind: 'image-compare',
  model: 'resunet_nll',
  samples: [
    {
      id: 'gt01',
      label: { it: 'GT01', en: 'GT01' },
      base: { ...image('gt01-rgb'), caption: { it: 'RGB', en: 'RGB' } },
      layers: [
        layer('predicted', 'Predicted IR'),
        layer('residual', 'Residual'),
      ],
    },
    {
      id: 'gt02',
      label: { it: 'GT02', en: 'GT02' },
      base: image('gt02-rgb'),
      layers: [layer('predicted', 'Predicted IR')],
    },
  ],
}

/** The cards `GET /projects` returns for a list of full projects. */
export const toSummaries = (projects: Project[]): ProjectSummary[] =>
  projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    description: project.description,
    areas: project.areas,
    context: project.context,
    cover: project.cover,
    metrics: project.metrics,
    technologies: project.technologies,
    repo_url: project.links.find(({ kind }) => kind === 'repo')?.url ?? null,
    status: project.status,
    created_at: project.created_at,
  }))

export const projectSummariesFixture = toSummaries(projectsFixture)

export const articlesFixture: LearningArticle[] = [
  {
    slug: 'big-o-notation',
    title: { it: 'Notazione Big-O', en: 'Big-O notation' },
    content_markdown: {
      it: 'Analisi della complessità con $O(n)$.',
      en: 'Complexity analysis basics. Growth rate: $O(n \\log n)$.\n\n```python\nx = 1\n```',
    },
    category: 'CS',
    tags: ['algorithms'],
    status: 'published',
    version: 3,
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-04-20T09:00:00Z',
  },
  {
    slug: 'dynamodb-modelling',
    title: { it: 'Modellazione DynamoDB', en: 'DynamoDB modelling' },
    content_markdown: {
      it: 'Single-table design.',
      en: 'Single-table design patterns.',
    },
    category: 'Data',
    tags: ['aws', 'nosql'],
    status: 'published',
    version: 1,
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
  },
]

export const versionsFixture: ArticleVersion[] = [
  { version: 3, updated_at: '2026-04-20T09:00:00Z', status: 'published' },
  { version: 2, updated_at: '2026-03-10T09:00:00Z', status: 'published' },
  { version: 1, updated_at: '2026-01-15T09:00:00Z', status: 'draft' },
]

export const technologiesFixture: Technology[] = [
  { id: 't1', name: 'Python', icon: 'python', category: 'language' },
  { id: 't2', name: 'React', icon: 'react', category: 'frontend' },
  { id: 't3', name: 'AWS', icon: 'aws', category: 'cloud' },
  { id: 't4', name: 'TypeScript', icon: 'typescript', category: 'language' },
]
