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
    expect(questLinks()).toHaveLength(2)
    expect(questLinks()[0]).toHaveTextContent('Business Data Analyst')
    expect(questLinks()[0]).toHaveTextContent('Work')
    expect(questLinks()[1]).toHaveTextContent('Study')
    expect(within(panel()).getByText('[Next quest]')).toBeInTheDocument()
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

    expect(
      await within(panel()).findByRole('link', { name: /Data pipeline/ }),
    ).toHaveAttribute('href', '/projects/data-pipeline')
    const infoEdge = within(panel()).getByRole('link', { name: /InfoEdge/ })
    expect(infoEdge).toHaveTextContent('Started:September 2019')
    expect(infoEdge).toHaveTextContent('Completed:November 2020')
    expect(infoEdge).not.toHaveTextContent('Objective:')
    expect(questLinks().map((link) => link.textContent)).toEqual([
      expect.stringContaining('Portfolio site'),
      expect.stringContaining('Data pipeline'),
      expect.stringContaining('Master'),
      expect.stringContaining('InfoEdge'),
      expect.stringContaining('Statistics'),
    ])
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
    screen.getByRole('tab', { name: /Active Quests/ }).focus()

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
