import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { QuestLog } from './QuestLog'

const panel = () => screen.getByRole('tabpanel')

describe('QuestLog', () => {
  it('opens on the active quests: current job and studies', () => {
    renderWithProviders(<QuestLog />)

    expect(screen.getByRole('tab', { name: /Active Quests/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const links = within(panel()).getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent(
      'Business Data Analyst — AdKaora (Mondadori Digital)',
    )
    expect(links[0]).toHaveTextContent('Work')
    expect(links[1]).toHaveTextContent('Study')
    expect(within(panel()).getByText('[Next quest]')).toBeInTheDocument()
  })

  it('lists completed jobs, degrees and projects newest first', async () => {
    renderWithProviders(<QuestLog />)

    await userEvent.click(screen.getByRole('tab', { name: /Completed Quests/ }))

    expect(
      await within(panel()).findByRole('link', { name: /Data pipeline/ }),
    ).toHaveAttribute('href', '/projects/data-pipeline')
    const years = within(panel())
      .getAllByRole('link')
      .map((link) => link.textContent?.match(/\d{4}$/)?.[0])
    expect(years).toEqual(['2026', '2026', '2025', '2020', '2019'])
    expect(within(panel()).queryByText('[Next quest]')).not.toBeInTheDocument()
  })

  it('counts the quests in each tab', async () => {
    renderWithProviders(<QuestLog />)

    expect(
      await screen.findByRole('tab', { name: /Completed Quests\s*5/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Active Quests\s*2/ })).toBeVisible()
  })

  it('switches tab with the arrow keys', async () => {
    renderWithProviders(<QuestLog />)
    const activeTab = screen.getByRole('tab', { name: /Active Quests/ })
    activeTab.focus()

    await userEvent.keyboard('{ArrowRight}')

    const completedTab = screen.getByRole('tab', { name: /Completed Quests/ })
    expect(completedTab).toHaveAttribute('aria-selected', 'true')
    expect(completedTab).toHaveFocus()
    expect(panel()).toHaveAttribute('aria-labelledby', completedTab.id)
  })

  it('links to the projects and the full journey', () => {
    renderWithProviders(<QuestLog />)

    expect(
      screen.getByRole('link', { name: 'Explore projects' }),
    ).toHaveAttribute('href', '/projects')
    expect(
      screen.getByRole('link', { name: 'Full journey →' }),
    ).toHaveAttribute('href', '/about-me')
  })
})
