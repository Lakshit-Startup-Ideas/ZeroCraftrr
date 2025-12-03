import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: '00:00', temp: 24, power: 120 },
    { name: '04:00', temp: 23, power: 110 },
    { name: '08:00', temp: 26, power: 140 },
    { name: '12:00', temp: 29, power: 180 },
    { name: '16:00', temp: 28, power: 170 },
    { name: '20:00', temp: 25, power: 130 },
];

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Power Usage</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,240 kWh</p>
                    <span className="text-green-500 text-sm font-medium">↓ 12% from yesterday</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Active Devices</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">24/25</p>
                    <span className="text-gray-500 text-sm font-medium">1 Offline</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Efficiency Score</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">94%</p>
                    <span className="text-green-500 text-sm font-medium">↑ 2% from last week</span>
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
                                <Line type="monotone" dataKey="temp" stroke="#8884d8" strokeWidth={2} />
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
                                <Line type="monotone" dataKey="power" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
