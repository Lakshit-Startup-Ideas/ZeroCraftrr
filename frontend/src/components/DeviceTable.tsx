type Device = {
  id: number
  identifier: string
  name: string
  type: string
  last_seen_at: string
  factory_id: number
}

type DeviceTableProps = {
  devices: Device[]
}

const DeviceTable = ({ devices }: DeviceTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 text-left">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-5 py-3 font-semibold">Name</th>
          <th className="px-5 py-3 font-semibold">Identifier</th>
          <th className="px-5 py-3 font-semibold">Type</th>
          <th className="px-5 py-3 font-semibold">Last Seen</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
        {devices.map((device) => (
          <tr key={device.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-medium text-slate-900">{device.name}</td>
            <td className="px-5 py-4">{device.identifier}</td>
            <td className="px-5 py-4 capitalize">{device.type}</td>
            <td className="px-5 py-4 text-xs text-slate-500">
              {new Date(device.last_seen_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {devices.length === 0 ? (
      <div className="px-5 py-10 text-center text-sm text-slate-500">
        Connect your first IoT device to start streaming telemetry.
      </div>
    ) : null}
  </div>
)

export default DeviceTable
