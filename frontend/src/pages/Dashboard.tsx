import React, { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw, Server, Shield, Zap } from 'lucide-react';
import { fetchDevices, fetchHealth, fetchTelemetry, fetchTelemetryAggregate } from '../services/data';

interface Device {
    id?: number;
    name?: string;
    device_id: string;
    is_active?: boolean;
}

interface TelemetryRecord {
    device_id?: string;
    temperature?: number;
    power_usage?: number;
    time?: string;
    timestamp?: string;
}

const Dashboard: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
    const [aggregate, setAggregate] = useState<any>(null);
    const [health, setHealth] = useState<string>('Checking...');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
                const [deviceData, telemetryData, aggregateData, healthData] = await Promise.all([
                fetchDevices(),
                fetchTelemetry({ limit: 10 }),
                fetchTelemetryAggregate(),
                fetchHealth(),
            ]);
            setDevices(deviceData || []);
            setTelemetry(Array.isArray(telemetryData) ? telemetryData : []);
            setAggregate(aggregateData ?? null);
            setHealth(
                typeof healthData === 'object' && healthData !== null
                    ? Object.values(healthData)[0]?.toString() || 'Unknown'
                    : (healthData as string) || 'Unknown'
            );
        } catch (err) {
            console.error('Failed to load dashboard data', err);
            setError('We could not fetch live data. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const activeDevices = devices.filter((d) => d.is_active).length;

    const aggregateMetrics = useMemo(() => {
        if (!aggregate) return [];
        if (Array.isArray(aggregate)) {
                return aggregate.slice(0, 3).map((item, idx) => ({
                    label: item?.metric || item?.name || `Metric ${idx + 1}`,
                    value: item?.value ?? item?.average ?? item?.avg ?? 'N/A',
                }));
            }
        return Object.entries(aggregate)
            .slice(0, 4)
            .map(([key, value]) => ({
                label: key.replace(/_/g, ' '),
                value: typeof value === 'number' ? value.toFixed(2) : String(value),
            }));
    }, [aggregate]);

    const recentTelemetry = telemetry.slice(0, 5);

    return (
        <div className="page">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="kicker">Dashboard</p>
                    <h1 className="text-2xl font-semibold text-ink-900">Live operations overview</h1>
                    <p className="text-ink-600">Devices, telemetry, and system health pulled directly from the API.</p>
                </div>
                <button
                    onClick={loadData}
                    className="btn btn-secondary"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh data
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-status-danger/30 bg-red-50 px-4 py-3 text-sm text-status-danger">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-600">Health</p>
                        <Shield className="h-5 w-5 text-brand-700" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{health}</p>
                    <p className="text-xs text-ink-500">/api/v1/health</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-600">Devices online</p>
                        <Server className="h-5 w-5 text-brand-700" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">
                        {activeDevices}/{devices.length}
                    </p>
                    <p className="text-xs text-ink-500">Active / total</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-600">Telemetry samples</p>
                        <Activity className="h-5 w-5 text-brand-700" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{telemetry.length}</p>
                    <p className="text-xs text-ink-500">Latest pull</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-600">AI aggregates</p>
                        <Zap className="h-5 w-5 text-brand-700" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{aggregateMetrics.length || 'N/A'}</p>
                    <p className="text-xs text-ink-500">From /telemetry/aggregate</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-ink-900">Devices</h3>
                            <p className="text-sm text-ink-600">Pulled from /devices</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        {devices.length === 0 ? (
                            <p className="text-sm text-ink-600">No devices yet. Register hardware to see it here.</p>
                        ) : (
                            devices.slice(0, 5).map((device) => (
                                <div
                                    key={device.device_id}
                                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-ink-900">{device.name || device.device_id}</p>
                                        <p className="text-xs text-ink-500">{device.device_id}</p>
                                    </div>
                                    <span
                                        className={`badge ${device.is_active ? 'badge-success' : ''}`}
                                    >
                                        {device.is_active ? 'Active' : 'Idle'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-ink-900">AI aggregates</h3>
                            <p className="text-sm text-ink-600">Signals extracted from telemetry</p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {aggregateMetrics.length === 0 ? (
                            <p className="text-sm text-ink-600">No aggregate data yet.</p>
                        ) : (
                            aggregateMetrics.map((metric) => (
                                <div key={metric.label} className="rounded-lg border border-border bg-surface-subtle px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                                        {metric.label}
                                    </p>
                                    <p className="text-xl font-bold text-ink-900">{metric.value}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-ink-900">Recent telemetry</h3>
                        <p className="text-sm text-ink-600">Most recent samples from /telemetry</p>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-ink-500">
                            <tr>
                                <th className="py-2 pr-4">Device</th>
                                <th className="py-2 pr-4">Temperature</th>
                                <th className="py-2 pr-4">Power</th>
                                <th className="py-2 pr-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-ink-700">
                            {recentTelemetry.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-ink-600">
                                        No telemetry records yet.
                                    </td>
                                </tr>
                            ) : (
                                recentTelemetry.map((record, idx) => (
                                    <tr key={`${record.device_id}-${idx}`}>
                                        <td className="py-3 pr-4 font-medium text-ink-900">
                                            {record.device_id || 'N/A'}
                                        </td>
                                        <td className="py-3 pr-4">{record.temperature ?? 'N/A'} C</td>
                                        <td className="py-3 pr-4">{record.power_usage ?? 'N/A'} kWh</td>
                                        <td className="py-3 pr-4 text-xs text-ink-500">
                                            {record.timestamp ||
                                                record.time ||
                                                new Date().toLocaleString(undefined, {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {loading && (
                <div className="text-sm text-ink-600">
                    Fetching latest data from {import.meta.env.VITE_API_URL || 'API'}...
                </div>
            )}
        </div>
    );
};

export default Dashboard;
