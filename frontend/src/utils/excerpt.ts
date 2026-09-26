const DEFAULT_LENGTH = 160

/** Ordered markdown -> plain text rewrites (images before links). */
const MARKDOWN_RULES: ReadonlyArray<[RegExp, string]> = [
  [/```[^\n]*\n?/g, ' '], // code fence markers (the code itself is kept)
  [/!\[[^\]]*\]\([^)]*\)/g, ' '], // images: dropped entirely
  [/\[([^\]]*)\]\([^)]*\)/g, '$1'], // links: keep the text
  [/^\s{0,3}#{1,6}\s+/gm, ''], // heading markers
  [/^\s{0,3}>\s?/gm, ''], // blockquote markers
  [/^\s*(?:[-*+]|\d+\.)\s+/gm, ''], // list markers
  [/^\s*(?:[-*_]\s*){3,}$/gm, ' '], // horizontal rules
  [/[*~`]/g, ''], // emphasis, strikethrough and inline code markers
  [/(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])/gu, ''], // _emphasis_, not snake_case
]

/**
 * Build a short plain-text excerpt from markdown content.
 *
 * Strips the most common markdown syntax (keeping link text and dropping
 * images), collapses whitespace and truncates to `length` characters with an
 * ellipsis when needed. Hyphens and underscores inside words are preserved.
 * Used for meta descriptions and cards where no summary field exists.
 */
export const excerpt = (markdown: string, length = DEFAULT_LENGTH): string => {
  const text = MARKDOWN_RULES.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    markdown,
  )
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}…`
}
