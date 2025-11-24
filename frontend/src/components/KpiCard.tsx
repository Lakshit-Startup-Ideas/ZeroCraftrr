type KpiCardProps = {
  label: string
  value: string
  delta?: number
  unit?: string
}

const formatDelta = (delta?: number) => {
  if (delta === undefined) return null
  const sign = delta >= 0 ? '+' : ''
  const color = delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
  return <span className={`text-xs ${color}`}>{`${sign}${delta.toFixed(1)}% vs last 24h`}</span>
}

const KpiCard = ({ label, value, delta, unit }: KpiCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-3xl font-semibold text-slate-900">{value}</span>
      {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
    </div>
    <div className="mt-3">{formatDelta(delta)}</div>
  </div>
)

export default KpiCard
