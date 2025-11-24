import { useEffect, useState } from 'react';

import api from '../services/api';

export type MetricsSummary = {
  total_energy_kwh: number
  total_co2_kg: number
  total_waste_kg: number
  total_waste_co2_kg: number
}

export type Alert = {
  id: number
  severity: 'low' | 'medium' | 'high'
  message: string
  created_at: string
}

export type Device = {
  id: number
  identifier: string
  name: string
  type: string
  last_seen_at: string
  factory_id: number
}

const defaultMetrics: MetricsSummary = {
  total_energy_kwh: 0,
  total_co2_kg: 0,
  total_waste_kg: 0,
  total_waste_co2_kg: 0
}

const useTelemetry = () => {
  const [metrics, setMetrics] = useState<MetricsSummary>(defaultMetrics)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const [summaryRes, deviceRes] = await Promise.all([
        api.get('/telemetry/summary').catch(() => ({ data: defaultMetrics })),
        api.get('/devices').catch(() => ({ data: [] }))
      ])
      setMetrics(summaryRes.data)
      // Alerts endpoint to be wired when backend provides dedicated API
      setAlerts([])
      setDevices(deviceRes.data)
    } catch (error) {
      console.error('Failed to load telemetry', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = window.setInterval(load, 30000)
    return () => window.clearInterval(interval)
  }, [])

  return { metrics, alerts, devices, loading, reload: load }
}

export default useTelemetry
