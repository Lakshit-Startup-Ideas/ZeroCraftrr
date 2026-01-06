import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { logout } = useAuth();

    return (
        <div className="page">
            <div>
                <p className="kicker">Settings</p>
                <h2 className="text-2xl font-semibold text-ink-900">Workspace settings</h2>
            </div>

            <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-ink-900">Profile settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label">Email notifications</label>
                        <div className="mt-2">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-brand-700 accent-brand-700"
                                    defaultChecked
                                />
                                <span className="text-sm text-ink-700">Receive critical alerts via email</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="label">Theme</label>
                        <select className="input mt-1">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-status-danger">Danger zone</h3>
                <button
                    onClick={logout}
                    className="btn btn-danger"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
