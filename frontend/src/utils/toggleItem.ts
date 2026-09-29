/** `items` with `item` removed when present, appended otherwise. */
export const toggleItem = <T>(items: readonly T[], item: T): T[] =>
  items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item]
