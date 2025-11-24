import { useState } from 'react'

import ReportDownload from '../components/ReportDownload'
import { formatCo2, formatEnergy, formatWaste } from '../utils/format'
import useTelemetry from '../hooks/useTelemetry'

const Reports = () => {
  const { metrics } = useTelemetry()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleDownload = (format: 'pdf' | 'csv') => {
    setStatusMessage(`A ${format.toUpperCase()} report will be generated and emailed to you.`)
    window.setTimeout(() => setStatusMessage(null), 5000)
  }

  const rows = [
    { label: 'Energy (last 24h)', value: formatEnergy(metrics.total_energy_kwh) },
    { label: 'CO₂ Emissions', value: formatCo2(metrics.total_co2_kg) },
    { label: 'Waste Output', value: formatWaste(metrics.total_waste_kg) },
    { label: 'Waste CO₂e', value: formatCo2(metrics.total_waste_co2_kg) }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ESG Reporting</h1>
        <p className="text-sm text-slate-500">
          Export ESG-aligned sustainability metrics to share with auditors and stakeholders.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Metric</th>
              <th className="px-5 py-3 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-5 py-4 font-medium text-slate-900">{row.label}</td>
                <td className="px-5 py-4">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReportDownload onDownload={handleDownload} />

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}
    </div>
  )
}

export default Reports
