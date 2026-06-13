const DEFAULT_LENGTH = 160

/**
 * Build a short plain-text excerpt from markdown content.
 *
 * Strips the most common markdown markers, collapses whitespace and
 * truncates to `length` characters with an ellipsis when needed. Used for
 * meta descriptions where no dedicated summary field exists.
 */
export const excerpt = (markdown: string, length = DEFAULT_LENGTH): string => {
  const text = markdown
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}…`
}
