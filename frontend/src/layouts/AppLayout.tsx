import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AppLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-surface text-ink-900">
            <Navbar />
            <main className="container w-full flex-1 py-10 lg:py-12">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;
