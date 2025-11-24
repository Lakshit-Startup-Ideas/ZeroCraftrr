type Alert = {
  id: number
  severity: 'low' | 'medium' | 'high'
  message: string
  created_at: string
}

type AlertListProps = {
  alerts: Alert[]
}

const severityStyles: Record<Alert['severity'], string> = {
  low: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  medium: 'bg-amber-50 text-amber-600 border border-amber-100',
  high: 'bg-rose-50 text-rose-600 border border-rose-100'
}

const AlertList = ({ alerts }: AlertListProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-800">Active Alerts</h2>
      <span className="text-xs text-slate-500">{alerts.length} active</span>
    </div>
    <div className="mt-4 space-y-3">
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500">No alerts detected in the last 24 hours.</p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg px-4 py-3 text-sm transition ${severityStyles[alert.severity]}`}
          >
            <p className="font-medium">{alert.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)

export default AlertList
