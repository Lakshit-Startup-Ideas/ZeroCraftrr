import React from 'react';
import { Globe2, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="page">
            <div className="card">
                <div className="flex flex-col gap-4">
                    <p className="kicker">About ZeroCraftr</p>
                    <h1 className="text-3xl font-semibold text-ink-900">We craft AI-led reliability for sustainable ops.</h1>
                    <p className="text-lg text-ink-700">
                        ZeroCraftr is built for teams that run critical devices and infrastructure. We give you telemetry you can
                        trust, AI-driven recommendations you can explain, and sustainability metrics you can defend.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        icon: <ShieldCheck className="h-6 w-6 text-brand-700" />,
                        title: 'Secure foundation',
                        body: 'JWT-secured APIs, protected routes, and sensible defaults so teams can move fast without cutting corners.',
                    },
                    {
                        icon: <Sparkles className="h-6 w-6 text-brand-700" />,
                        title: 'AI that explains itself',
                        body: 'Anomaly detection, forecasts, and contextual insights rendered alongside raw telemetry for full clarity.',
                    },
                    {
                        icon: <Leaf className="h-6 w-6 text-brand-700" />,
                        title: 'Sustainability built in',
                        body: 'Track power draw and carbon impact, and get nudges that drive greener operations without sacrificing uptime.',
                    },
                ].map((item) => (
                    <div key={item.title} className="card">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-ink-900">{item.title}</h3>
                        </div>
                        <p className="mt-3 text-ink-700">{item.body}</p>
                    </div>
                ))}
            </div>

            <div className="card-muted">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-ink-900">What ZeroCraftr does</h2>
                        <p className="text-ink-700">
                            ZeroCraftr ingests device telemetry, aggregates it, and overlays AI/ML models to spot early signals of
                            risk. We keep operators informed with human-friendly dashboards, actionable alerts, and sustainability
                            scoring built into every workflow.
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="badge">Telemetry APIs</span>
                            <span className="badge">AI overlays</span>
                            <span className="badge">Carbon insights</span>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-semibold text-ink-900">Sustainability + AI mission</h3>
                        <p className="mt-3 text-ink-700">
                            We believe reliability and sustainability are the same problem. By reducing waste in power usage, we
                            unlock more reliable systems. By making AI outputs explainable, we build trust with operators and
                            regulators alike.
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-sm text-ink-600">
                            <Globe2 className="h-5 w-5 text-brand-700" />
                            Global-first deployments with local compliance in mind.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
