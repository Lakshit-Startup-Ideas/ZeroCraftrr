import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import * as d3 from 'd3';
import { toast } from 'react-toastify';

import { fetchCombinedForecast, ForecastPoint, TelemetryPoint } from '../services/api';

type ForecastState = {
  points: ForecastPoint[];
  actuals: TelemetryPoint[];
  metrics: Record<string, number>;
};

const Forecast = () => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ForecastState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    loadForecast();
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!state || !canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      return;
    }
    chartRef.current?.destroy();
    const predictedSeries = state.points.map((point) => ({
      x: point.timestamp,
      y: point.prediction
    }));
    const actualSeries = state.actuals.map((point) => ({
      x: point.timestamp,
      y: point.energy_kwh
    }));
    const allValues = [...predictedSeries, ...actualSeries].map((entry) => entry.y);
    const extent = d3.extent(allValues) as [number, number];
    const minVal = Number.isFinite(extent[0]) ? (extent[0] as number) : 0;
    const maxVal = Number.isFinite(extent[1]) ? (extent[1] as number) : minVal + 1;
    const colorScale = d3.scaleLinear<string>()
      .domain([minVal, maxVal])
      .range(['#22c55e', '#ef4444']);
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, colorScale(maxVal));
    gradient.addColorStop(1, colorScale(minVal));
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Predicted kWh',
            data: predictedSeries,
            borderColor: gradient,
            backgroundColor: 'rgba(34,197,94,0.15)',
            tension: 0.3,
            fill: true,
            pointRadius: 0
          },
          {
            label: 'Actual kWh',
            data: actualSeries,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14,165,233,0.2)',
            tension: 0.3,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'hour', tooltipFormat: 'MMM d HH:mm' },
            ticks: { autoSkip: true, maxTicksLimit: 12 }
          },
          y: {
            title: { display: true, text: 'kWh' }
          }
        }
      }
    });
  }, [state]);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const response = await fetchCombinedForecast(1);
      setState({
        points: response.points,
        actuals: response.recent_actuals,
        metrics: response.metrics
      });
      toast.success('Combined forecast updated');
    } catch (error) {
      toast.error('Unable to load forecast');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forecast</h1>
          <p className="text-sm text-slate-500">Ensemble predictions with LSTM + Prophet + RandomForest</p>
        </div>
        <button
          onClick={loadForecast}
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">MAE</p>
          <p className="text-2xl font-semibold text-slate-900">
            {state ? state.metrics.mae?.toFixed(2) : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">MAPE</p>
          <p className="text-2xl font-semibold text-slate-900">
            {state ? `${state.metrics.mape?.toFixed(2)}%` : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Horizon</p>
          <p className="text-2xl font-semibold text-slate-900">24h</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Confidence</p>
          <p className="text-2xl font-semibold text-slate-900">
            {state ? `${(state.metrics.mae ? Math.max(0, 100 - state.metrics.mae) : 0).toFixed(1)}%` : '--'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="h-96">
          <canvas ref={canvasRef} aria-label="Forecast vs Actual chart" role="img" />
        </div>
      </div>

      {state && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Confidence Bands</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {state.points.slice(0, 6).map((point) => (
              <div key={point.timestamp} className="rounded border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-700">
                  {new Date(point.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-slate-500">
                  {point.lower.toFixed(1)} – {point.upper.toFixed(1)} kWh
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;
