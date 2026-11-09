import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

const SKILL_TOKENS = [
  { icon: '{ }', className: 'bg-brand-yellow text-brand-ink' },
  { icon: '⇄', className: 'bg-brand-orange text-brand-ink' },
  { icon: '▥', className: 'bg-brand-cyan text-brand-ink' },
  { icon: '✦', className: 'bg-brand-teal text-brand-cream' },
] as const

interface CardSkill {
  title: string
  items: string
}

const SECTION_TITLE =
  // Light theme swaps the accent between section titles and skill names.
  'font-display text-sm font-extrabold uppercase tracking-[0.12em] text-heading dark:text-highlight'

/** Back of the card, in the quest-card palette: skills and description. */
export const CardBack = () => {
  const { t } = useTranslation()
  const skills = t('home.card.skills', { returnObjects: true }) as CardSkill[]

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className={SECTION_TITLE}>{t('home.card.skillsTitle')}</h2>
        <ul className="flex flex-col">
          {skills.map(({ title, items }, index) => (
            <li
              key={title}
              // Tighter rows where the card is smallest: phones and the
              // 340px lg column.
              className="flex items-center gap-3 border-b border-edge py-1.5 last:border-b-0 max-[359px]:py-1 sm:py-2.5 lg:py-2 xl:py-2.5"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base font-extrabold max-[359px]:h-8 max-[359px]:w-8 sm:h-10 sm:w-10',
                  SKILL_TOKENS[index % SKILL_TOKENS.length].className,
                )}
              >
                {SKILL_TOKENS[index % SKILL_TOKENS.length].icon}
              </span>
              <span className="flex flex-col">
                <span className="font-display text-lg font-bold uppercase leading-tight text-highlight dark:text-heading">
                  {title}
                </span>
                <span className="text-sm text-muted">{items}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 border-t-2 border-edge pt-3 sm:pt-4">
        <h2 className={SECTION_TITLE}>{t('home.card.descriptionTitle')}</h2>
        <p className="text-sm leading-relaxed text-body sm:text-base">
          {t('home.card.description')}
        </p>
      </section>
    </>
  )
}
