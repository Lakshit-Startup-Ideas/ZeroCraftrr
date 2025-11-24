import DeviceTable from '../components/DeviceTable'
import useTelemetry from '../hooks/useTelemetry'

const Devices = () => {
  const { devices, reload } = useTelemetry()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Connected Devices</h1>
          <p className="text-sm text-slate-500">
            Manage the IoT meters and sensors that stream telemetry into ZeroCraftr.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary md:w-auto"
        >
          Refresh
        </button>
      </div>
      <DeviceTable devices={devices} />
    </div>
  )
}

export default Devices
