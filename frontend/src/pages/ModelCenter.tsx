import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { fetchModelRegistry, ModelRegistryEntry, triggerRetrain } from '../services/api';

const ModelCenter = () => {
  const [models, setModels] = useState<ModelRegistryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);

  const loadModels = async () => {
    setLoading(true);
    try {
      const entries = await fetchModelRegistry();
      setModels(entries);
    } catch (error) {
      toast.error('Unable to load registry');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const runRetrain = async () => {
    setRetraining(true);
    try {
      const response = await triggerRetrain(1);
      toast.success(`Retrain complete · MAE ${response.forecast_mae.toFixed(2)}`);
      await loadModels();
    } catch (error) {
      toast.error('Retrain failed');
      console.error(error);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Model Center</h1>
          <p className="text-sm text-slate-500">Audit trail of every retrain run plus manual trigger controls.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadModels}
            disabled={loading}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={runRetrain}
            disabled={retraining}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {retraining ? 'Retraining...' : 'Manual Retrain'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Accuracy</th>
              <th className="px-4 py-3 text-left">Artifact</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No models registered yet.
                </td>
              </tr>
            )}
            {models.map((model) => (
              <tr key={`${model.model_name}-${model.version}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{model.model_name}</td>
                <td className="px-4 py-3">{model.version}</td>
                <td className="px-4 py-3">{model.accuracy ? model.accuracy.toFixed(3) : '--'}</td>
                <td className="px-4 py-3 break-all">{model.path}</td>
                <td className="px-4 py-3">{new Date(model.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelCenter;
