import { render, screen } from '@testing-library/react';

import KpiCard from '../components/KpiCard';

test('renders KPI label and value', () => {
  render(<KpiCard label="Energy" value="120 kWh" delta={5.2} />);
  expect(screen.getByText('Energy')).toBeInTheDocument();
  expect(screen.getByText('120 kWh')).toBeInTheDocument();
  expect(screen.getByText('+5.2% vs last 24h')).toBeInTheDocument();
});