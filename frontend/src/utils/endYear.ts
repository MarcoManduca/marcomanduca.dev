const YEAR = /\d{4}/g

/** Last four-digit year in a CV period such as "Sept 2019 — Nov 2020". */
export const endYear = (period: string): number | undefined => {
  const years = period.match(YEAR)
  return years ? Number(years[years.length - 1]) : undefined
}
