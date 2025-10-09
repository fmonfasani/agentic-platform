import { render, screen, waitFor } from '@testing-library/react'
import AreasDashboardPage from './page'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { area: 'Técnico', avgGrade: 0.87, totalAgents: 4, avgRewards: 12, totalUses: 10, totalDownloads: 5, totalTraces: 3 },
      ]),
  })
) as any

describe('AreasDashboardPage', () => {
  it('renders table headers and data', async () => {
    render(<AreasDashboardPage />)

    await waitFor(() => screen.getByText(/Desempeño por Área/i))

    expect(screen.getByText('Técnico')).toBeInTheDocument()
    expect(screen.getByText('Calidad Prom.')).toBeInTheDocument()
  })
})
