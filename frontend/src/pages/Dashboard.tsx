import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TelemetryPoint {
    name: string;
    temp: number;
    power: number;
}

const initialData: TelemetryPoint[] = [
    { name: '00:00', temp: 24, power: 120 },
    { name: '04:00', temp: 23, power: 110 },
    { name: '08:00', temp: 26, power: 140 },
    { name: '12:00', temp: 29, power: 180 },
    { name: '16:00', temp: 28, power: 170 },
    { name: '20:00', temp: 25, power: 130 },
];

export default function Dashboard() {
    const [data, setData] = useState<TelemetryPoint[]>(initialData);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:8000/api/v1/ws/telemetry');

        ws.onopen = () => {
            console.log('Connected to Telemetry WS');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { timestamp, data: telemetry } = message;

                // Format time (simplified)
                const time = new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                setData(prev => {
                    const newData = [...prev, {
                        name: time,
                        temp: telemetry.temperature || 0,
                        power: telemetry.power_usage || 0
                    }];
                    // Keep last 20 points
                    return newData.slice(-20);
                });
            } catch (e) {
                console.error('Error parsing WS message', e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Telemetry WS');
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex justify-end">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isConnected ? 'Live Connected' : 'Disconnected'}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Power Usage</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {data.length > 0 ? data[data.length - 1].power : 0} kWh
                    </p>
                    <span className="text-green-500 text-sm font-medium">Live</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Active Devices</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">24/25</p>
                    <span className="text-gray-500 text-sm font-medium">1 Offline</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Current Temp</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {data.length > 0 ? data[data.length - 1].temp.toFixed(1) : 0}°C
                    </p>
                    <span className="text-green-500 text-sm font-medium">Live</span>
                </div>
            </div>

            {/* Charts */}
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
                                <Line type="monotone" dataKey="temp" stroke="#8884d8" strokeWidth={2} isAnimationActive={false} />
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
                                <Line type="monotone" dataKey="power" stroke="#82ca9d" strokeWidth={2} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
