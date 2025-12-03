import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Settings, LogOut, Activity, Server } from 'lucide-react';

export default function Layout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-indigo-400">ZeroCraftr</h1>
                </div>
                <nav className="mt-8">
                    <Link to="/" className="flex items-center px-6 py-3 hover:bg-gray-800">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link to="/devices" className="flex items-center px-6 py-3 hover:bg-gray-800">
                        <Server className="w-5 h-5 mr-3" />
                        Devices
                    </Link>
                    <Link to="/alerts" className="flex items-center px-6 py-3 hover:bg-gray-800">
                        <Activity className="w-5 h-5 mr-3" />
                        Alerts
                    </Link>
                    <Link to="/settings" className="flex items-center px-6 py-3 hover:bg-gray-800">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4">
                    <button onClick={handleLogout} className="flex items-center px-6 py-3 text-gray-400 hover:text-white w-full">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm">
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
