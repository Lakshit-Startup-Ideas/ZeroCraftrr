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
        <header className="sticky top-0 z-30 border-b border-border bg-surface-raised">
            <div className="container flex items-center justify-between gap-6 py-4">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-ink-900">
                    <Sparkles className="h-6 w-6 text-brand-700" />
                    ZeroCraftr
                </Link>

                <nav className="flex flex-wrap items-center gap-2 text-sm">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                [
                                    'nav-link',
                                    isActive ? 'nav-link-active' : '',
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
                                <span className="text-ink-900">{user?.full_name || user?.email}</span>
                                <span className="text-xs text-ink-500">Signed in</span>
                            </div>
                            <button
                                onClick={logout}
                                className="btn btn-secondary"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="btn btn-ghost"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary"
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
