import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface TelemetryPoint {
    name: string;
    temp: number;
    power: number;
}

interface Device {
    id: number;
    device_id: string;
    name: string;
    is_active: boolean;
    site_id: number;
}

export default function Dashboard() {
    const [data, setData] = useState<TelemetryPoint[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [stats, setStats] = useState<{ total: number; active: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hydrateDevices = async () => {
        try {
            const res = await api.get<Device[]>('/devices');
            setDevices(res.data);
            setStats({
                total: res.data.length,
                active: res.data.filter((d) => d.is_active).length,
            });
            if (!selectedDevice && res.data.length > 0) {
                setSelectedDevice(res.data[0].device_id);
            }
        } catch (err) {
            console.error('Failed to fetch devices', err);
            setStats(null);
        }
    };

    const fetchTelemetrySnapshot = async (deviceId: string) => {
        try {
            const res = await api.get('/telemetry', { params: { device_id: deviceId, limit: 50 } });
            const points: TelemetryPoint[] = (res.data || []).map((item: any) => ({
                name: new Date(item.time || item.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                temp: item.temperature || 0,
                power: item.power_usage || 0,
            }));
            setData(points.slice(-20));
        } catch (err) {
            console.error('Failed to fetch telemetry snapshot', err);
        } finally {
            setLoading(false);
        }
    };

    const startPolling = (deviceId: string) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => fetchTelemetrySnapshot(deviceId), 15000);
    };

    useEffect(() => {
        hydrateDevices();
    }, []);

    useEffect(() => {
        if (!selectedDevice) return;
        fetchTelemetrySnapshot(selectedDevice);
        startPolling(selectedDevice);

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/telemetry';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { timestamp, data: telemetry } = message;
                const deviceId = message.device_id;
                if (selectedDevice && deviceId !== selectedDevice) return;

                const timeLabel = new Date(timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                setData((prev) => {
                    const next = [
                        ...prev,
                        {
                            name: timeLabel,
                            temp: telemetry?.temperature || 0,
                            power: telemetry?.power_usage || 0,
                        },
                    ];
                    return next.slice(-20);
                });
            } catch (e) {
                console.error('Error parsing WS message', e);
            }
        };
        ws.onerror = () => {
            setIsConnected(false);
            startPolling(selectedDevice);
        };
        ws.onclose = () => {
            setIsConnected(false);
            startPolling(selectedDevice);
        };

        return () => {
            ws.close();
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [selectedDevice]);

    const latest = data.length ? data[data.length - 1] : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Live Dashboard</h2>
                    <p className="text-sm text-gray-500">Streaming telemetry with REST fallback</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        className="border rounded px-3 py-2 text-sm"
                        value={selectedDevice || ''}
                        onChange={(e) => setSelectedDevice(e.target.value || null)}
                    >
                        <option value="">Select device</option>
                        {devices.map((d) => (
                            <option key={d.device_id} value={d.device_id}>
                                {d.name || d.device_id}
                            </option>
                        ))}
                    </select>
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                            isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {isConnected ? 'Live Connected' : 'REST Fallback'}
                    </span>
                </div>
            </div>

            {(!devices.length || !selectedDevice) && (
                <div className="bg-white p-6 rounded-lg shadow-sm text-gray-600">
                    No devices available yet. Add a device to start streaming telemetry.
                </div>
            )}

            {devices.length > 0 && selectedDevice && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-gray-500 text-sm font-medium">Total Power Usage (latest)</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{latest?.power ?? 0} kWh</p>
                            <span className="text-green-500 text-sm font-medium">{isConnected ? 'Live' : 'Recent'}</span>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-gray-500 text-sm font-medium">Active Devices</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats ? `${stats.active}/${stats.total}` : '—'}
                            </p>
                            <span className="text-gray-500 text-sm font-medium">
                                {stats ? `${stats.total - stats.active} Offline` : 'Unavailable'}
                            </span>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-gray-500 text-sm font-medium">Current Temp</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {latest ? latest.temp.toFixed(1) : '—'}°C
                            </p>
                            <span className="text-green-500 text-sm font-medium">{isConnected ? 'Live' : 'Recent'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Trend</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Power Consumption</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="power"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {loading && <div className="text-sm text-gray-500">Loading telemetry…</div>}
        </div>
    );
}
