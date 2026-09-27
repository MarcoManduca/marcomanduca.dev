/**
 * Minimum card heights from a fixed line budget, so every card of a tab has
 * the same height and nothing moves when the language changes. Titles and
 * facts are clamped to the same budget (phones | from `sm`):
 *
 * - active:    title 2|1 · guild 2|1 · started 1 · objective 3|2 · boss 3|2 ·
 *              rewards 2|1 (details 20px lines, 4px apart)
 * - completed: title 2|1 · first fact 2|1 · dates 2|1
 *
 * Height = 4px border + padding (28|36px) + title (24|32px lines) + 6px gap
 * + details. Keep in sync with QuestCard, QuestFacts and NextQuestSlot.
 */
export const QUEST_CARD_HEIGHT = {
  active: 'min-h-[20.125rem] sm:min-h-[14.625rem]',
  completed: 'min-h-[10.375rem] sm:min-h-[7.375rem]',
} as const

/** Quest name: two lines on phones, one from `sm`. */
export const QUEST_TITLE =
  'line-clamp-2 font-display text-xl font-bold leading-6 sm:line-clamp-1 sm:text-[26px] sm:leading-8'
