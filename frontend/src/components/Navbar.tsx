import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sparkles } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Home', requiresAuth: false },
    { to: '/about', label: 'About', requiresAuth: false },
    { to: '/ai-overview', label: 'AI Overview', requiresAuth: true },
    { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
];

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    ZeroCraftr
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                [
                                    'transition-colors hover:text-indigo-600',
                                    isActive ? 'text-indigo-600' : '',
                                    !isAuthenticated && item.requiresAuth ? 'opacity-70' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3 text-sm font-medium">
                    {isAuthenticated ? (
                        <>
                            <div className="hidden sm:flex flex-col items-end leading-tight text-right">
                                <span className="text-slate-800">{user?.full_name || user?.email}</span>
                                <span className="text-xs text-slate-500">Signed in</span>
                            </div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-md px-3 py-2 text-slate-700 transition hover:text-indigo-600"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
