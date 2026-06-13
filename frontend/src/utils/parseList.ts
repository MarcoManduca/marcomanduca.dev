/** Parse a comma-separated input into a trimmed, non-empty string array. */
export const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

/** Parse a multi-line input into a trimmed, non-empty string array. */
export const parseLines = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
