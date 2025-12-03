import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { logout } = useAuth();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

            <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                        <div className="mt-2">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" defaultChecked />
                                <span className="ml-2 text-gray-700">Receive critical alerts via email</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Theme</label>
                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <button
                    onClick={logout}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
