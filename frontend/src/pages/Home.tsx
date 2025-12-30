import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, ShieldCheck, Wifi } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="space-y-16">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 py-12 text-white shadow-soft lg:px-12 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-6">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                            <span className="h-2 w-2 rounded-full bg-accent-300" />
                            Live telemetry-ready
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                            AI-powered telemetry for resilient, sustainable infrastructure.
                        </h1>
                        <p className="text-lg text-white/80">
                            ZeroCraftr ingests device data in real-time, layers AI/ML to predict failures, and keeps your
                            energy footprint accountable. Built for teams that need production-grade observability, not just
                            charts.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/register"
                                className="rounded-lg bg-white px-5 py-3 font-semibold text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Get started free
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-lg border border-white/50 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: 'Realtime devices', value: 'Live streams', icon: <Wifi className="h-5 w-5" /> },
                                    { title: 'AI insights', value: 'Predictive', icon: <Cpu className="h-5 w-5" /> },
                                    { title: 'Sustainability', value: 'Carbon aware', icon: <Activity className="h-5 w-5" /> },
                                    { title: 'Secure by default', value: 'JWT + RBAC', icon: <ShieldCheck className="h-5 w-5" /> },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-xl border border-white/15 bg-white/5 p-4">
                                        <div className="flex items-center justify-between text-sm text-white/70">
                                            <span>{item.title}</span>
                                            <span className="text-white/80">{item.icon}</span>
                                        </div>
                                        <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Product</p>
                        <h2 className="text-2xl font-semibold text-slate-900">From raw signals to actions</h2>
                        <p className="text-slate-600">
                            Plug your devices into ZeroCraftr and ship AI-assisted operations in weeks, not months.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/ai-overview"
                            className="rounded-md bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700"
                        >
                            See AI overview
                        </Link>
                        <Link
                            to="/dashboard"
                            className="rounded-md border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
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
                        <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                            <p className="mt-3 text-slate-600">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-card">
                <div className="grid gap-8 md:grid-cols-2 md:items-center">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Mission</p>
                        <h3 className="text-2xl font-semibold text-slate-900">AI that respects reliability and climate.</h3>
                        <p className="text-slate-700">
                            ZeroCraftr blends ML-driven anomaly detection with a sustainability-first operational model. Every
                            feature is designed to keep systems resilient while cutting unnecessary power draw.
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">Secure APIs</span>
                            <span className="rounded-full bg-accent-50 px-3 py-1 text-accent-700">Carbon-aware</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Predictive AI</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-6">
                        <ol className="space-y-4 text-slate-700">
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
                                    1
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">Connect devices</p>
                                    <p className="text-sm">Use the API to stream telemetry and register your hardware fleet.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
                                    2
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">Run AI overlays</p>
                                    <p className="text-sm">Enable anomaly detection, predictions, and sustainability scoring.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
                                    3
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">Act with context</p>
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
