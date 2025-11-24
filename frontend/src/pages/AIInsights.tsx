import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { InsightResponse, requestInsight } from '../services/api';

const AIInsights = () => {
  const [energySummary, setEnergySummary] = useState('Peak demand recorded during afternoon shift with 12% variance.');
  const [forecastSummary, setForecastSummary] = useState('Forecast expects 5% increase tomorrow between 14:00-18:00.');
  const [optimizationSummary, setOptimizationSummary] = useState('Load balancing reduces compressor runtime by 40 minutes.');
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await requestInsight({
        site_id: 1,
        energy_summary: energySummary,
        forecast_summary: forecastSummary,
        optimization_summary: optimizationSummary
      });
      setInsight(response);
      toast.success('Insight generated');
    } catch (error) {
      toast.error('Unable to generate insight');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">AI Insights</h1>
        <p className="text-sm text-slate-500">Tiny transformer provides actionable recommendations with confidence scoring.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Energy Summary
          <textarea
            className="mt-2 flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
            rows={6}
            value={energySummary}
            onChange={(event) => setEnergySummary(event.target.value)}
          />
        </label>
        <label className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Forecast Highlights
          <textarea
            className="mt-2 flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
            rows={6}
            value={forecastSummary}
            onChange={(event) => setForecastSummary(event.target.value)}
          />
        </label>
        <label className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Optimization Context
          <textarea
            className="mt-2 flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
            rows={6}
            value={optimizationSummary}
            onChange={(event) => setOptimizationSummary(event.target.value)}
          />
        </label>
        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Insight'}
          </button>
        </div>
      </form>

      {insight && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recommendation</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Confidence: {(insight.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <p className="mt-4 text-base text-slate-700">{insight.insight}</p>
          <p className="mt-2 text-xs uppercase text-slate-400">
            Generated {new Date(insight.generated_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
