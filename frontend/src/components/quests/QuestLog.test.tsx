import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { QuestLog } from './QuestLog'

const panel = () => screen.getByRole('tabpanel')
const questLinks = () => within(panel()).getAllByRole('link')

describe('QuestLog', () => {
  it('opens on the active quests: current job and studies', () => {
    renderWithProviders(<QuestLog />)

    expect(screen.getByRole('tab', { name: /Active Quests/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(questLinks()).toHaveLength(3)
    expect(questLinks()[0]).toHaveTextContent('Business Data Analyst')
    expect(questLinks()[0]).toHaveTextContent('Work')
    expect(questLinks()[1]).toHaveTextContent('Study')
    expect(questLinks()[2]).toHaveTextContent('[Next quest]')
  })

  it('links each CV quest to its entry on the About page timeline', async () => {
    renderWithProviders(<QuestLog />)

    expect(questLinks()[0]).toHaveAttribute('href', '/about-me#work-2020-11')
    expect(questLinks()[1]).toHaveAttribute('href', '/about-me#study-2025-09')

    await userEvent.click(screen.getByRole('tab', { name: /Completed Quests/ }))

    expect(
      within(panel()).getByRole('link', { name: /InfoEdge/ }),
    ).toHaveAttribute('href', '/about-me#work-2019-09')
  })

  it('turns the next quest slot into a link to the contacts page', () => {
    renderWithProviders(<QuestLog />)

    expect(
      within(panel()).getByRole('link', { name: /Next quest.*Get in touch/ }),
    ).toHaveAttribute('href', '/contacts')
  })

  it('shows the full quest name as a tooltip, since long names are clamped', async () => {
    renderWithProviders(<QuestLog />)

    await userEvent.click(screen.getByRole('tab', { name: /Completed Quests/ }))

    const name = '1st-Level Master in AI and Data Analytics'
    expect(within(panel()).getByTitle(name)).toHaveTextContent(name)
  })

  it('expands active quests with guild, start, objective, boss and rewards', () => {
    renderWithProviders(<QuestLog />)

    const job = questLinks()[0]
    expect(job).toHaveTextContent('Guild:AdKaora (Mondadori Digital)')
    expect(job).toHaveTextContent('Started:November 2020')
    expect(job).toHaveTextContent('Objective:')
    expect(job).toHaveTextContent('Final Boss:')
    expect(job).toHaveTextContent('Rewards:Python')
    expect(job).not.toHaveTextContent('Completed:')
  })

  it('lists completed quests newest first with guild and dates only', async () => {
    renderWithProviders(<QuestLog />)

    await userEvent.click(screen.getByRole('tab', { name: /Completed Quests/ }))

    const infoEdge = within(panel()).getByRole('link', { name: /InfoEdge/ })
    expect(infoEdge).toHaveTextContent('Started:September 2019')
    expect(infoEdge).toHaveTextContent('Completed:November 2020')
    expect(infoEdge).not.toHaveTextContent('Objective:')
    expect(questLinks().map((link) => link.textContent)).toEqual([
      expect.stringContaining('Master'),
      expect.stringContaining('InfoEdge'),
      expect.stringContaining('Statistics'),
    ])
    expect(within(panel()).queryByText('[Next quest]')).not.toBeInTheDocument()
  })

  it('leaves the published projects out of the quest log', async () => {
    renderWithProviders(<QuestLog />)

    await userEvent.click(screen.getByRole('tab', { name: /Completed Quests/ }))

    expect(questLinks()).toHaveLength(3)
    expect(
      within(panel()).queryByRole('link', { name: /Data pipeline/ }),
    ).not.toBeInTheDocument()
  })

  it('counts the quests in each tab', () => {
    renderWithProviders(<QuestLog />)

    expect(
      screen.getByRole('tab', { name: /Completed Quests\s*3/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Active Quests\s*2/ })).toBeVisible()
  })

  it('switches tab with the arrow keys', async () => {
    renderWithProviders(<QuestLog />)
    screen.getByRole('tab', { name: /Active Quests/ }).focus()

    await userEvent.keyboard('{ArrowRight}')

    const completedTab = screen.getByRole('tab', { name: /Completed Quests/ })
    expect(completedTab).toHaveAttribute('aria-selected', 'true')
    expect(completedTab).toHaveFocus()
    expect(panel()).toHaveAttribute('aria-labelledby', completedTab.id)
  })

  it('links to the full journey, leaving the projects to the side quests', () => {
    renderWithProviders(<QuestLog />)

    expect(
      screen.getByRole('link', { name: 'Full journey →' }),
    ).toHaveAttribute('href', '/about-me')
    expect(
      screen.queryByRole('link', { name: /projects/i }),
    ).not.toBeInTheDocument()
  })
})
