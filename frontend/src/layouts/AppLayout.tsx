import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AppLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8 lg:py-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;
