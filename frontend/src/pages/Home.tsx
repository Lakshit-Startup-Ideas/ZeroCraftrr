import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, ShieldCheck, Wifi } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="page">
            <section className="card">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="space-y-6">
                        <p className="badge inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent-500" />
                            Live telemetry-ready
                        </p>
                        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink-900 md:text-4xl">
                            AI-powered telemetry for resilient, sustainable infrastructure.
                        </h1>
                        <p className="text-lg text-ink-600">
                            ZeroCraftr ingests device data in real-time, layers AI/ML to predict failures, and keeps your
                            energy footprint accountable. Built for teams that need production-grade observability, not just
                            charts.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/register"
                                className="btn btn-primary"
                            >
                                Get started free
                            </Link>
                            <Link
                                to="/login"
                                className="btn btn-secondary"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    <div className="card-muted">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Realtime devices', value: 'Live streams', icon: <Wifi className="h-5 w-5" /> },
                                { title: 'AI insights', value: 'Predictive', icon: <Cpu className="h-5 w-5" /> },
                                { title: 'Sustainability', value: 'Carbon aware', icon: <Activity className="h-5 w-5" /> },
                                { title: 'Secure by default', value: 'JWT + RBAC', icon: <ShieldCheck className="h-5 w-5" /> },
                            ].map((item) => (
                                <div key={item.title} className="rounded-lg border border-border bg-surface-raised p-4">
                                    <div className="flex items-center justify-between text-sm text-ink-600">
                                        <span>{item.title}</span>
                                        <span className="text-ink-500">{item.icon}</span>
                                    </div>
                                    <p className="mt-2 text-lg font-semibold text-ink-900">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="kicker">Product</p>
                        <h2 className="text-2xl font-semibold text-ink-900">From raw signals to actions</h2>
                        <p className="text-ink-600">
                            Plug your devices into ZeroCraftr and ship AI-assisted operations in weeks, not months.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/ai-overview"
                            className="btn btn-primary"
                        >
                            See AI overview
                        </Link>
                        <Link
                            to="/dashboard"
                            className="btn btn-secondary"
                        >
                            View dashboard
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            title: 'Telemetry ingestion',
                            body: 'Collect device data over API and websockets, auto-normalized for downstream AI.',
                        },
                        {
                            title: 'Predictive maintenance',
                            body: 'Spot anomalies and predict failures before they impact availability or SLA.',
                        },
                        {
                            title: 'Sustainable by design',
                            body: 'Track energy usage, optimize runtimes, and report carbon-aware insights to stakeholders.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="card">
                            <h3 className="text-lg font-semibold text-ink-900">{item.title}</h3>
                            <p className="mt-3 text-ink-600">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="card">
                <div className="grid gap-8 md:grid-cols-2 md:items-center">
                    <div className="space-y-4">
                        <p className="kicker">Mission</p>
                        <h3 className="text-2xl font-semibold text-ink-900">AI that respects reliability and climate.</h3>
                        <p className="text-ink-700">
                            ZeroCraftr blends ML-driven anomaly detection with a sustainability-first operational model. Every
                            feature is designed to keep systems resilient while cutting unnecessary power draw.
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="badge">Secure APIs</span>
                            <span className="badge">Carbon-aware</span>
                            <span className="badge">Predictive AI</span>
                        </div>
                    </div>
                    <div className="card-muted">
                        <ol className="space-y-4 text-ink-700">
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white">
                                    1
                                </span>
                                <div>
                                    <p className="font-semibold text-ink-900">Connect devices</p>
                                    <p className="text-sm">Use the API to stream telemetry and register your hardware fleet.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white">
                                    2
                                </span>
                                <div>
                                    <p className="font-semibold text-ink-900">Run AI overlays</p>
                                    <p className="text-sm">Enable anomaly detection, predictions, and sustainability scoring.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white">
                                    3
                                </span>
                                <div>
                                    <p className="font-semibold text-ink-900">Act with context</p>
                                    <p className="text-sm">Use the dashboard and AI overview to respond with full situational awareness.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
