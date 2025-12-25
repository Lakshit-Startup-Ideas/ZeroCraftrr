import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-12 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            ZeroCraftr
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Empowering sustainable infrastructure with AI-driven telemetry and predictive insights.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/ai-overview" className="hover:text-indigo-600">AI Overview</Link></li>
                            <li><Link to="/dashboard" className="hover:text-indigo-600">Live Dashboard</Link></li>
                            <li><Link to="/about" className="hover:text-indigo-600">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">Resources</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-indigo-600">Documentation</a></li>
                            <li><a href="#" className="hover:text-indigo-600">API Reference</a></li>
                            <li><a href="#" className="hover:text-indigo-600">System Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-indigo-600">Cookie Data</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} ZeroCraftr Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-slate-600"><Github className="h-5 w-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-slate-600"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-slate-600"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
