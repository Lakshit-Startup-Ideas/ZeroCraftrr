import React from 'react';
import { Globe2, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="space-y-12">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-card">
                <div className="flex flex-col gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">About ZeroCraftr</p>
                    <h1 className="text-3xl font-semibold text-slate-900">We craft AI-led reliability for sustainable ops.</h1>
                    <p className="text-lg text-slate-700">
                        ZeroCraftr is built for teams that run critical devices and infrastructure. We give you telemetry you can
                        trust, AI-driven recommendations you can explain, and sustainability metrics you can defend.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        icon: <ShieldCheck className="h-6 w-6 text-brand-600" />,
                        title: 'Secure foundation',
                        body: 'JWT-secured APIs, protected routes, and sensible defaults so teams can move fast without cutting corners.',
                    },
                    {
                        icon: <Sparkles className="h-6 w-6 text-brand-600" />,
                        title: 'AI that explains itself',
                        body: 'Anomaly detection, forecasts, and contextual insights rendered alongside raw telemetry for full clarity.',
                    },
                    {
                        icon: <Leaf className="h-6 w-6 text-brand-600" />,
                        title: 'Sustainability built in',
                        body: 'Track power draw and carbon impact, and get nudges that drive greener operations without sacrificing uptime.',
                    },
                ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        </div>
                        <p className="mt-3 text-slate-700">{item.body}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">What ZeroCraftr does</h2>
                        <p className="text-slate-700">
                            ZeroCraftr ingests device telemetry, aggregates it, and overlays AI/ML models to spot early signals of
                            risk. We keep operators informed with human-friendly dashboards, actionable alerts, and sustainability
                            scoring built into every workflow.
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="rounded-full bg-white px-3 py-1 text-brand-700">Telemetry APIs</span>
                            <span className="rounded-full bg-white px-3 py-1 text-brand-700">AI overlays</span>
                            <span className="rounded-full bg-white px-3 py-1 text-brand-700">Carbon insights</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-card">
                        <h3 className="text-lg font-semibold text-slate-900">Sustainability + AI mission</h3>
                        <p className="mt-3 text-slate-700">
                            We believe reliability and sustainability are the same problem. By reducing waste in power usage, we
                            unlock more reliable systems. By making AI outputs explainable, we build trust with operators and
                            regulators alike.
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                            <Globe2 className="h-5 w-5 text-brand-600" />
                            Global-first deployments with local compliance in mind.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
