/** Calendar years from the earliest `YYYY-MM` month to `today`'s year. */
export const yearsSince = (months: string[], today = new Date()) =>
  today.getFullYear() -
  Math.min(...months.map((month) => Number(month.slice(0, 4))))
