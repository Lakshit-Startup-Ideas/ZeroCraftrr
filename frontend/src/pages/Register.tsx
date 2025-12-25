import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({ email, password, full_name: fullName });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Could not create your account. Please try again or use a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Create your ZeroCraftr account</h1>
                    <p className="text-slate-600">Register to start streaming telemetry and AI insights.</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Full name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Alex Operator"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? 'Creating account…' : 'Register'}
                    </button>
                </form>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Already have an account?</p>
                    <p className="text-sm text-slate-600">Login to access your dashboards and AI overview.</p>
                </div>
                <Link to="/login" className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Register;
