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
            <div className="card">
                <div className="mb-6 space-y-2">
                    <h1 className="text-2xl font-semibold text-ink-900">Create your ZeroCraftr account</h1>
                    <p className="text-ink-600">Register to start streaming telemetry and AI insights.</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-status-danger/30 bg-red-50 px-4 py-3 text-sm text-status-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input mt-1"
                            placeholder="Alex Operator"
                        />
                    </div>
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
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
            </div>

            <div className="card flex items-center justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink-900">Already have an account?</p>
                    <p className="text-sm text-ink-600">Login to access your dashboards and AI overview.</p>
                </div>
                <Link to="/login" className="btn btn-secondary">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Register;
