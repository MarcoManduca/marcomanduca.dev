/**
 * Quest card heights. Every card of a tab has the same height (the list is
 * a grid of equal rows) and the height stays put when the language changes:
 *
 * - from `sm`: a fixed line budget. Title and each detail take one clamped
 *   line (details 20px, 4px apart): active = title + 5 details, completed =
 *   title + guild + dates. Height = 4px border + 36px padding + 32px title +
 *   6px gap + details.
 * - phones: details run full width under medal and name; titles and details
 *   clamp at two lines. The minimums are the tallest card of either language
 *   on the current copy, at 360px (below 375px) and 390px (above): re-measure
 *   them when the quest copy changes.
 */
export const QUEST_CARD_HEIGHT = {
  active:
    'min-h-[15.125rem] min-[375px]:min-h-[14.125rem] sm:min-h-[12.125rem]',
  completed: 'min-h-[9.125rem] sm:min-h-[7.375rem]',
  nextQuest: 'min-h-[6.375rem] sm:min-h-[7.375rem]',
} as const

/** Quest name: two lines on phones, one from `sm`. */
export const QUEST_TITLE =
  'line-clamp-2 font-display text-xl font-bold leading-6 sm:line-clamp-1 sm:text-[26px] sm:leading-8'
