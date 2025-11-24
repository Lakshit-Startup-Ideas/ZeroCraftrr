import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { EquipmentConfigPayload, OptimizationResponse, requestOptimization } from '../services/api';

const defaultEquipment: EquipmentConfigPayload[] = [
  { name: 'Press #1', load_pct: 85, runtime_hours: 16, idle_hours: 4 },
  { name: 'HVAC', load_pct: 70, runtime_hours: 12, idle_hours: 6 }
];

const Optimization = () => {
  const [equipment, setEquipment] = useState<EquipmentConfigPayload[]>(defaultEquipment);
  const [lambdaWeight, setLambdaWeight] = useState(0.5);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const updateConfig = (index: number, field: keyof EquipmentConfigPayload, value: number) => {
    setEquipment((prev) =>
      prev.map((config, idx) => (idx === index ? { ...config, [field]: value } : config))
    );
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, index: number, field: keyof EquipmentConfigPayload) => {
    updateConfig(index, field, Number(event.target.value));
  };

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await requestOptimization(1, equipment, lambdaWeight);
      setResult(response);
      toast.success('Optimization completed');
    } catch (error) {
      toast.error('Optimization failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Optimization</h1>
          <p className="text-sm text-slate-500">
            Bayesian optimization balances energy draw and CO₂e using Optuna + Prometheus metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">
            λ weight
            <input
              type="number"
              min={0}
              step={0.1}
              value={lambdaWeight}
              onChange={(event) => setLambdaWeight(Number(event.target.value))}
              className="ml-2 w-20 rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            onClick={runOptimization}
            disabled={loading}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {equipment.map((config, index) => (
          <div key={config.name} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{config.name}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Baseline</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm text-slate-600">
                Load %
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  value={config.load_pct}
                  onChange={(event) => handleInputChange(event, index, 'load_pct')}
                />
              </label>
              <label className="text-sm text-slate-600">
                Runtime h
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  value={config.runtime_hours}
                  onChange={(event) => handleInputChange(event, index, 'runtime_hours')}
                />
              </label>
              <label className="text-sm text-slate-600">
                Idle h
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  value={config.idle_hours}
                  onChange={(event) => handleInputChange(event, index, 'idle_hours')}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Objective</p>
              <p className="text-2xl font-semibold text-slate-900">{result.objective.toFixed(1)}</p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Savings</p>
              <p className={`text-2xl font-semibold ${result.savings_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.savings_pct.toFixed(2)}%
              </p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">CO₂e</p>
              <p className="text-2xl font-semibold text-slate-900">{result.co2_kg.toFixed(1)} kg</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Load %</th>
                  <th className="px-3 py-2">Runtime h</th>
                  <th className="px-3 py-2">Idle h</th>
                </tr>
              </thead>
              <tbody>
                {result.recommended.map((config) => (
                  <tr key={config.name} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{config.name}</td>
                    <td className="px-3 py-2">{config.load_pct.toFixed(1)}</td>
                    <td className="px-3 py-2">{config.runtime_hours.toFixed(1)}</td>
                    <td className="px-3 py-2">{config.idle_hours.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimization;
