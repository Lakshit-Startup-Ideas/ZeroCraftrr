import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Reports from './pages/Reports';
import Forecast from './pages/Forecast';
import Optimization from './pages/Optimization';
import AIInsights from './pages/AIInsights';
import ModelCenter from './pages/ModelCenter';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/devices', label: 'Devices' },
  { path: '/reports', label: 'Reports' },
  { path: '/forecast', label: 'Forecast' },
  { path: '/optimization', label: 'Optimization' },
  { path: '/ai-insights', label: 'AI Insights' },
  { path: '/model-center', label: 'Model Center' }
];

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-primary">ZeroCraftr</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">MVP</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition hover:text-primary ${isActive ? 'text-primary' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/model-center" element={<ModelCenter />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  </BrowserRouter>
);

export default App;
