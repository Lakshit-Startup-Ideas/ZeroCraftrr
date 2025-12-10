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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <button
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    onClick={() => setShowModal(true)}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Device
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site ID</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredDevices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No devices found
                                </td>
                            </tr>
                        ) : (
                            filteredDevices.map((device) => (
                                <tr key={device.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.device_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                device.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {device.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.site_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Device</h3>
                        <form className="space-y-4" onSubmit={createDevice}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.deviceId}
                                    onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Site ID</label>
                                <input
                                    type="number"
                                    required
                                    value={newDevice.siteId}
                                    onChange={(e) => setNewDevice({ ...newDevice, siteId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
                            >
                                {submitting ? 'Saving…' : 'Create Device'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
