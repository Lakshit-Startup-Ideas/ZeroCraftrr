import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Plus, Search, X } from 'lucide-react';

interface Device {
    id: number;
    name: string;
    device_id: string;
    is_active: boolean;
    site_id: number;
}

export default function Devices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debounced, setDebounced] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', deviceId: '', siteId: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchDevices = async (term?: string) => {
        try {
            const response = await api.get('/devices', {
                params: { search: term || undefined },
            });
            setDevices(response.data);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices(debounced);
    }, [debounced]);

    const filteredDevices = useMemo(() => {
        if (!debounced) return devices;
        return devices.filter(
            (d) =>
                d.name.toLowerCase().includes(debounced.toLowerCase()) ||
                d.device_id.toLowerCase().includes(debounced.toLowerCase())
        );
    }, [devices, debounced]);

    const createDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/devices', {
                name: newDevice.name,
                device_id: newDevice.deviceId,
                site_id: Number(newDevice.siteId),
                is_active: true,
            });
            setShowModal(false);
            setNewDevice({ name: '', deviceId: '', siteId: '' });
            fetchDevices(debounced);
        } catch (err) {
            console.error('Failed to create device', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="kicker">Devices</p>
                    <h2 className="text-2xl font-semibold text-ink-900">Device registry</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-search w-64"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-ink-400" />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <Plus className="h-5 w-5" />
                    Add Device
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-surface-raised shadow-card">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-ink-500">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Name</th>
                            <th className="px-6 py-3 text-left font-semibold">Device ID</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Site ID</th>
                            <th className="px-6 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface-raised text-sm text-ink-600">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-ink-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredDevices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-ink-500">
                                    No devices found
                                </td>
                            </tr>
                        ) : (
                            filteredDevices.map((device) => (
                                <tr key={device.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-ink-900">{device.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-ink-500">{device.device_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${device.is_active ? 'badge-success' : ''}`}>
                                            {device.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-ink-500">{device.site_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="btn btn-ghost">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
                    <div className="card relative w-full max-w-md">
                        <button
                            className="absolute right-4 top-4 text-ink-500 hover:text-ink-700"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="mb-4 text-lg font-semibold text-ink-900">Add Device</h3>
                        <form className="space-y-4" onSubmit={createDevice}>
                            <div>
                                <label className="label">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                    className="input mt-1"
                                />
                            </div>
                            <div>
                                <label className="label">Device ID</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.deviceId}
                                    onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                                    className="input mt-1"
                                />
                            </div>
                            <div>
                                <label className="label">Site ID</label>
                                <input
                                    type="number"
                                    required
                                    value={newDevice.siteId}
                                    onChange={(e) => setNewDevice({ ...newDevice, siteId: e.target.value })}
                                    className="input mt-1"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary w-full disabled:opacity-60"
                            >
                                {submitting ? 'Saving...' : 'Create Device'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
