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
            <div className="card">
                <div className="mb-6 space-y-2">
                    <h1 className="text-2xl font-semibold text-ink-900">Welcome back</h1>
                    <p className="text-ink-600">Access your ZeroCraftr workspace and monitor live telemetry.</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-status-danger/30 bg-red-50 px-4 py-3 text-sm text-status-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input mt-1"
                            placeholder="you@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input mt-1"
                            placeholder="********"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>

            <div className="card flex items-center justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink-900">New to ZeroCraftr?</p>
                    <p className="text-sm text-ink-600">Create an account to start streaming telemetry.</p>
                </div>
                <Link to="/register" className="btn btn-secondary">
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Login;
