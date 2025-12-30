import { useEffect, useState } from 'react';
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
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alerts</p>
                <h2 className="text-2xl font-semibold text-slate-900">System alerts</h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-6 text-center text-slate-500">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No active alerts. System is healthy.</div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between gap-4 p-6 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-full p-2 ${
                                            alert.severity === 'CRITICAL'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                        }`}
                                    >
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-900">{alert.message}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {new Date(alert.created_at).toLocaleString()}
                                            </span>
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                                                {alert.device_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!alert.is_resolved && (
                                    <button
                                        onClick={() => resolveAlert(alert.id)}
                                        className="flex items-center rounded-lg bg-accent-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-accent-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
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
