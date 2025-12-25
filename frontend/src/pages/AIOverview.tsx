import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, LineChart, Radio, Sparkle, Wand2 } from 'lucide-react';
import { fetchTelemetry, fetchTelemetryAggregate } from '../services/data';

interface TelemetryRecord {
    device_id?: string;
    temperature?: number;
    power_usage?: number;
    time?: string;
    timestamp?: string;
}

const AIOverview: React.FC = () => {
    const [aggregate, setAggregate] = useState<any>(null);
    const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [agg, telem] = await Promise.all([fetchTelemetryAggregate(), fetchTelemetry({ limit: 8 })]);
            setAggregate(agg ?? null);
            setTelemetry(Array.isArray(telem) ? telem : []);
        } catch (err) {
            console.error('Unable to fetch AI overview data', err);
            setError('Unable to load AI data. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const aggregateMetrics = useMemo(() => {
        if (!aggregate) return [];
        if (Array.isArray(aggregate)) {
            return aggregate.slice(0, 4).map((item, idx) => ({
                label: item?.metric || item?.name || `Signal ${idx + 1}`,
                value: item?.value ?? item?.average ?? item?.avg ?? '—',
                context: item?.description || 'AI-derived metric',
            }));
        }
        return Object.entries(aggregate)
            .slice(0, 4)
            .map(([key, value]) => ({
                label: key.replace(/_/g, ' '),
                value: typeof value === 'number' ? value.toFixed(2) : String(value),
                context: 'Aggregated from telemetry',
            }));
    }, [aggregate]);

    return (
        <div className="space-y-10">
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-10 text-white shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                            <Sparkle className="h-4 w-4" />
                            AI Overview
                        </p>
                        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                            Explainable AI for telemetry-driven operations
                        </h1>
                        <p className="max-w-3xl text-lg text-indigo-100">
                            ZeroCraftr blends raw device data with AI/ML overlays to predict issues before they escalate. All
                            insights come from your live /telemetry and /telemetry/aggregate endpoints.
                        </p>
                    </div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-indigo-700 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Go to dashboard
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                            <Brain className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Model inputs</p>
                            <p className="text-xs text-slate-600">Powered by /telemetry</p>
                        </div>
                    </div>
                    <p className="mt-3 text-slate-700">
                        Real-time temperature, power, and device state become features for anomaly detection and forecast models.
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                            <LineChart className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Aggregations</p>
                            <p className="text-xs text-slate-600">From /telemetry/aggregate</p>
                        </div>
                    </div>
                    <p className="mt-3 text-slate-700">
                        Rolling averages, peaks, and stability bands feed into explainable scorecards and sustainability nudges.
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                            <Wand2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">AI actions</p>
                            <p className="text-xs text-slate-600">Predictive + sustainable</p>
                        </div>
                    </div>
                    <p className="mt-3 text-slate-700">
                        Outcome recommendations include pre-emptive maintenance, load balancing, and low-carbon scheduling
                        suggestions.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Aggregate signals</h3>
                        <p className="text-sm text-slate-600">Derived directly from /telemetry/aggregate</p>
                    </div>
                    <div className="text-sm text-slate-600">
                        {loading ? 'Loading signals…' : `${aggregateMetrics.length} signals loaded`}
                    </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {aggregateMetrics.length === 0 ? (
                        <p className="text-sm text-slate-600">No aggregate metrics available yet.</p>
                    ) : (
                        aggregateMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{metric.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                                <p className="text-xs text-slate-600">{metric.context}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Telemetry feed</h3>
                        <p className="text-sm text-slate-600">Latest records feeding the AI layer</p>
                    </div>
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                        <Radio className="h-4 w-4" />
                        Refresh feed
                    </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="py-2 pr-4">Device</th>
                                <th className="py-2 pr-4">Temperature</th>
                                <th className="py-2 pr-4">Power</th>
                                <th className="py-2 pr-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {telemetry.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-slate-600">
                                        Waiting for telemetry...
                                    </td>
                                </tr>
                            ) : (
                                telemetry.map((row, idx) => (
                                    <tr key={`${row.device_id}-${idx}`}>
                                        <td className="py-3 pr-4 font-medium text-slate-900">{row.device_id || 'N/A'}</td>
                                        <td className="py-3 pr-4">{row.temperature ?? '—'}°C</td>
                                        <td className="py-3 pr-4">{row.power_usage ?? '—'} kWh</td>
                                        <td className="py-3 pr-4 text-xs text-slate-500">
                                            {row.timestamp ||
                                                row.time ||
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
        </div>
    );
};

export default AIOverview;
