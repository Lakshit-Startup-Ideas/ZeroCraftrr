import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Alert {
    id: number;
    device_id: string;
    severity: string;
    message: string;
    is_resolved: boolean;
    created_at: string;
    resolved_at?: string;
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/alerts');
            setAlerts(response.data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (id: number) => {
        try {
            await api.put(`/alerts/${id}`, { is_resolved: true });
            fetchAlerts();
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">System Alerts</h2>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No active alerts. System is healthy.</div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{alert.message}</h3>
                                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {new Date(alert.created_at).toLocaleString()}
                                            </span>
                                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {alert.device_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!alert.is_resolved && (
                                    <button
                                        onClick={() => resolveAlert(alert.id)}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Resolve
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
