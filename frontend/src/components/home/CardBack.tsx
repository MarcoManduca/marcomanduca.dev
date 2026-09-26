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
  'font-display text-sm font-extrabold uppercase tracking-[0.12em] text-card-accent dark:text-brand-yellow'

/** Back of the card: core skills and a short description. */
export const CardBack = () => {
  const { t } = useTranslation()
  const skills = t('home.card.skills', { returnObjects: true }) as CardSkill[]

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-card-weave-light dark:bg-card-weave"
      />
      <section className="relative flex flex-col gap-2">
        <h2 className={SECTION_TITLE}>{t('home.card.skillsTitle')}</h2>
        <ul className="flex flex-col">
          {skills.map(({ title, items }, index) => (
            <li
              key={title}
              className="flex items-center gap-3 border-b border-card-ink/15 py-2.5 dark:border-brand-cream/15 last:border-b-0"
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
                <span className="font-display text-lg font-bold uppercase leading-tight text-card-ink dark:text-brand-cream">
                  {title}
                </span>
                <span className="text-sm text-card-muted dark:text-brand-mist">
                  {items}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative flex flex-col gap-2 border-t-2 border-card-accent/30 pt-4 dark:border-brand-yellow/30">
        <h2 className={SECTION_TITLE}>{t('home.card.descriptionTitle')}</h2>
        <p className="text-base leading-relaxed text-card-ink dark:text-brand-mist">
          {t('home.card.description')}
        </p>
      </section>

      <p className="relative mt-auto text-right font-display text-sm font-bold italic text-card-muted dark:text-brand-fog">
        {t('home.card.serial')}
      </p>
    </>
  )
}
