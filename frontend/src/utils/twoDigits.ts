/** A side quest number as shown on the cards: `3` → `03`. */
export const twoDigits = (value: number) => String(value).padStart(2, '0')
