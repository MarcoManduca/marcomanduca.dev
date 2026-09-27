import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

const SKILL_TOKENS = [
  { icon: '{ }', className: 'bg-brand-yellow text-brand-ink' },
  { icon: '⇄', className: 'bg-brand-orange text-brand-ink' },
  { icon: '▥', className: 'bg-brand-cyan text-brand-ink' },
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
              className="flex items-center gap-3 border-b border-edge py-2.5 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-extrabold',
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

      <section className="flex flex-col gap-2 border-t-2 border-edge pt-4">
        <h2 className={SECTION_TITLE}>{t('home.card.descriptionTitle')}</h2>
        <p className="text-base leading-relaxed text-body">
          {t('home.card.description')}
        </p>
      </section>
    </>
  )
}
