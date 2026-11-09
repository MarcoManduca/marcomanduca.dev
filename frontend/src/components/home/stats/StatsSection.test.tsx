import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { StatsSection } from './StatsSection'

const point = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`^${name}: level`) })

describe('StatsSection', () => {
  it('plots every CV skill group with its level', () => {
    renderWithProviders(<StatsSection />)

    expect(screen.getByRole('heading', { name: 'Statistics' })).toBeVisible()
    expect(
      screen.getAllByRole('button', { name: /: level \d+ of 10$/ }),
    ).toHaveLength(6)
    expect(
      screen.getByRole('button', { name: 'Programming: level 9 of 10' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Data Visualization: level 10 of 10',
      }),
    ).toBeInTheDocument()
  })

  it('lists each group beside the chart, leaving tools to the tooltip', () => {
    renderWithProviders(<StatsSection />)

    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(6)
    expect(rows[0]).toHaveTextContent(/^Programming$/)
    expect(rows[1]).toHaveTextContent(/^Statistics & ML$/)
    expect(rows[4]).toHaveTextContent(/^CRM & Storage$/)
    expect(rows[5]).toHaveTextContent(/^AI & Agents$/)
  })

  it('shows levels as pips only, never as a score out of ten', () => {
    renderWithProviders(<StatsSection />)

    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Version control/i)).not.toBeInTheDocument()
  })

  it('shows every tool of a group on hover, and hides them on leave', async () => {
    renderWithProviders(<StatsSection />)

    await userEvent.hover(point('Data Engineering'))
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'AWS Athena · AWS Glue · AWS Lambda · SAS Data Integration · SAS Data Management',
    )
    expect(point('Data Engineering')).toHaveAccessibleDescription(/AWS Athena/)

    await userEvent.unhover(point('Data Engineering'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the tooltip to keyboard users until they move on or press Escape', async () => {
    renderWithProviders(<StatsSection />)

    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Programming')

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('toggles the tooltip with a tap, as touch has no hover', async () => {
    renderWithProviders(<StatsSection />)
    const tap = () =>
      userEvent.pointer({ keys: '[TouchA]', target: point('CRM & Storage') })

    await tap()
    expect(screen.getByRole('tooltip')).toHaveTextContent('PostgreSQL')

    await tap()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('lights a point on the chart from its row in the list', async () => {
    renderWithProviders(<StatsSection />)

    await userEvent.hover(
      within(screen.getAllByRole('listitem')[4]).getByText('CRM & Storage'),
    )

    expect(screen.getByRole('tooltip')).toHaveTextContent('Salesforce')
  })

  it('shows the AI capabilities on the AI & Agents point', async () => {
    renderWithProviders(<StatsSection />)

    await userEvent.hover(point('AI & Agents'))

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'LLM APIs · RAG & vector DBs · Agents & MCP · Prompt engineering & evals',
    )
  })

  it('plots Statistics & ML with its tools', async () => {
    renderWithProviders(<StatsSection />)

    await userEvent.hover(point('Statistics & ML'))

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'R · scikit-learn · TensorFlow · Keras · SciPy',
    )
  })
})
