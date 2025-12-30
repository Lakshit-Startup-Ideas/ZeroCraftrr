import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = (location.state as { from?: string })?.from || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError('Unable to log in. Check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl space-y-8">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-card">
                <div className="mb-6 space-y-2">
                    <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
                    <p className="text-slate-600">Access your ZeroCraftr workspace and monitor live telemetry.</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            placeholder="you@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            placeholder="********"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">New to ZeroCraftr?</p>
                    <p className="text-sm text-slate-600">Create an account to start streaming telemetry.</p>
                </div>
                <Link
                    to="/register"
                    className="rounded-md bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800"
                >
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Login;
