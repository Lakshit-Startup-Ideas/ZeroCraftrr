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
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Devices</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Device registry</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
                <button
                    className="flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                    onClick={() => setShowModal(true)}
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Device
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Name</th>
                            <th className="px-6 py-3 text-left font-semibold">Device ID</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Site ID</th>
                            <th className="px-6 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-600">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredDevices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                                    No devices found
                                </td>
                            </tr>
                        ) : (
                            filteredDevices.map((device) => (
                                <tr key={device.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{device.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{device.device_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                device.is_active ? 'bg-accent-50 text-accent-700' : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {device.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{device.site_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-brand-600 hover:text-brand-800">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                        <button
                            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="mb-4 text-lg font-semibold text-slate-900">Add Device</h3>
                        <form className="space-y-4" onSubmit={createDevice}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-slate-200 p-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Device ID</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.deviceId}
                                    onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-slate-200 p-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Site ID</label>
                                <input
                                    type="number"
                                    required
                                    value={newDevice.siteId}
                                    onChange={(e) => setNewDevice({ ...newDevice, siteId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-slate-200 p-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex w-full justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
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
