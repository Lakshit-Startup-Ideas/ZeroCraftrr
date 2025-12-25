import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AppLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;
