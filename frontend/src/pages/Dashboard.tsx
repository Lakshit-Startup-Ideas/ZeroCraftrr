import KpiCard from '../components/KpiCard'
import TrendChart from '../components/TrendChart'
import AlertList from '../components/AlertList'
import useTelemetry from '../hooks/useTelemetry'
import { formatCo2, formatEnergy, formatWaste } from '../utils/format'

const Dashboard = () => {
  const { metrics, alerts, loading } = useTelemetry()

  const chartData = Array.from({ length: 8 }).map((_, index) => {
    const timestamp = new Date(Date.now() - (7 - index) * 60 * 60 * 1000).toISOString()
    return { timestamp, value: metrics.total_energy_kwh / 8 + index * 0.5 }
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Sustainability Control Tower</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Real-time insights for energy, emissions, and waste
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor device telemetry, proactively detect anomalies, and keep your ESG targets in
          check with ZeroCraftr.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Energy (24h)" value={formatEnergy(metrics.total_energy_kwh)} delta={3.2} />
        <KpiCard label="CO₂ Emissions" value={formatCo2(metrics.total_co2_kg)} delta={-1.4} />
        <KpiCard label="Waste Output" value={formatWaste(metrics.total_waste_kg)} delta={2.1} />
        <KpiCard label="Waste CO₂e" value={formatCo2(metrics.total_waste_co2_kg)} delta={0.8} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart data={chartData} metricLabel="Energy Consumption Trend" />
        </div>
        <AlertList alerts={alerts} />
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-6 text-center text-sm text-slate-500 shadow">
          Loading telemetry...
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
