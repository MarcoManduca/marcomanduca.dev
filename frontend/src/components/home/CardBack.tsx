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
  'font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow'

/** Back of the card: core skills and a short description. */
export const CardBack = () => {
  const { t } = useTranslation()
  const skills = t('home.card.skills', { returnObjects: true }) as CardSkill[]

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-card-weave"
      />
      <section className="relative flex flex-col gap-2">
        <h2 className={SECTION_TITLE}>{t('home.card.skillsTitle')}</h2>
        <ul className="flex flex-col">
          {skills.map(({ title, items }, index) => (
            <li
              key={title}
              className="flex items-center gap-3 border-b border-brand-cream/15 py-2.5 last:border-b-0"
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
                <span className="font-display text-lg font-bold uppercase leading-tight text-brand-cream">
                  {title}
                </span>
                <span className="text-sm text-brand-mist">{items}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative flex flex-col gap-2 border-t-2 border-brand-yellow/30 pt-4">
        <h2 className={SECTION_TITLE}>{t('home.card.descriptionTitle')}</h2>
        <p className="text-base leading-relaxed text-brand-mist">
          {t('home.card.description')}
        </p>
      </section>

      <div className="relative mt-auto flex items-center justify-between font-display text-sm font-bold text-brand-fog">
        <span>↻ {t('home.card.flipHint')}</span>
        <span className="italic">{t('home.card.serial')}</span>
      </div>
    </>
  )
}
