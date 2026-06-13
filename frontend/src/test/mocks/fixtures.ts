import type {
  ArticleVersion,
  Cv,
  LearningArticle,
  Project,
  Technology,
} from '@/types'

export const projectsFixture: Project[] = [
  {
    slug: 'data-pipeline',
    title: { it: 'Pipeline dati', en: 'Data pipeline' },
    description: {
      it: 'Una pipeline ETL serverless.',
      en: 'A serverless ETL pipeline.',
    },
    content_markdown: {
      it: '# Pipeline\n\nContenuto in italiano.',
      en: '# Pipeline\n\nBuilt with **AWS Lambda** and Step Functions.',
    },
    technologies: ['Python', 'AWS'],
    category: 'data',
    images: ['https://cdn.example.com/p1.png'],
    github_url: 'https://github.com/example/data-pipeline',
    demo_url: null,
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
    content_markdown: { it: 'Contenuto.', en: 'Content.' },
    technologies: ['React', 'TypeScript'],
    category: 'frontend',
    images: [],
    github_url: 'https://github.com/example/portfolio-site',
    demo_url: 'https://marcomanduca.dev',
    status: 'published',
    created_at: '2026-03-05T09:00:00Z',
    updated_at: '2026-03-06T09:00:00Z',
  },
]

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

/** CV localized to English, as returned by `GET /cv?lang=en`. */
export const cvFixtureEn: Cv = {
  lang: 'en',
  sections: {
    summary: 'Data and software engineer focused on AWS platforms.',
    experience: [
      { role: 'Data Engineer', company: 'Company', period: '2023 — Present' },
    ],
    skills: ['Python', 'AWS', 'React'],
  },
}

/** CV localized to Italian, as returned by `GET /cv?lang=it`. */
export const cvFixtureIt: Cv = {
  lang: 'it',
  sections: {
    summary: 'Ingegnere dati e software focalizzato su piattaforme AWS.',
    experience: [
      { role: 'Data Engineer', company: 'Azienda', period: '2023 — Presente' },
    ],
    skills: ['Python', 'AWS', 'React'],
  },
}
