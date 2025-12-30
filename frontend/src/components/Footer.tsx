import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-slate-200/70 bg-white py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Sparkles className="h-5 w-5 text-brand-600" />
                            ZeroCraftr
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Empowering sustainable infrastructure with AI-driven telemetry and predictive insights.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/ai-overview" className="hover:text-brand-600">AI Overview</Link></li>
                            <li><Link to="/dashboard" className="hover:text-brand-600">Live Dashboard</Link></li>
                            <li><Link to="/about" className="hover:text-brand-600">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Resources</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-brand-600">Documentation</a></li>
                            <li><a href="#" className="hover:text-brand-600">API Reference</a></li>
                            <li><a href="#" className="hover:text-brand-600">System Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-brand-600">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-600">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-600">Cookie Data</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row">
                    <p className="text-sm text-slate-500">
                        (c) {new Date().getFullYear()} ZeroCraftr Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-brand-600"><Github className="h-5 w-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-brand-600"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-brand-600"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
