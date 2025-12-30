import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { logout } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Settings</p>
                <h2 className="text-2xl font-semibold text-slate-900">Workspace settings</h2>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Profile settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email notifications</label>
                        <div className="mt-2">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-brand-600 accent-brand-600"
                                    defaultChecked
                                />
                                <span className="text-sm text-slate-700">Receive critical alerts via email</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Theme</label>
                        <select className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-red-600">Danger zone</h3>
                <button
                    onClick={logout}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
