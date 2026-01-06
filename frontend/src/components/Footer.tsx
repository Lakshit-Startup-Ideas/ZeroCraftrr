import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border bg-surface-raised py-12">
            <div className="container">
                <div className="grid gap-10 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-ink-900">
                            <Sparkles className="h-5 w-5 text-brand-700" />
                            ZeroCraftr
                        </Link>
                        <p className="text-sm leading-relaxed text-ink-600">
                            Empowering sustainable infrastructure with AI-driven telemetry and predictive insights.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Product</h4>
                        <ul className="space-y-3 text-sm text-ink-600">
                            <li><Link to="/ai-overview" className="hover:text-brand-700">AI Overview</Link></li>
                            <li><Link to="/dashboard" className="hover:text-brand-700">Live Dashboard</Link></li>
                            <li><Link to="/about" className="hover:text-brand-700">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Resources</h4>
                        <ul className="space-y-3 text-sm text-ink-600">
                            <li><a href="#" className="hover:text-brand-700">Documentation</a></li>
                            <li><a href="#" className="hover:text-brand-700">API Reference</a></li>
                            <li><a href="#" className="hover:text-brand-700">System Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Legal</h4>
                        <ul className="space-y-3 text-sm text-ink-600">
                            <li><a href="#" className="hover:text-brand-700">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-700">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-700">Cookie Data</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-ink-500 sm:flex-row">
                    <p className="text-sm text-ink-500">
                        (c) {new Date().getFullYear()} ZeroCraftr Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-ink-400 hover:text-brand-700"><Github className="h-5 w-5" /></a>
                        <a href="#" className="text-ink-400 hover:text-brand-700"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="text-ink-400 hover:text-brand-700"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
