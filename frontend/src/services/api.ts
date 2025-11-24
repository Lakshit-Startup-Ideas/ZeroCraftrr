import axios, { AxiosInstance } from 'axios';

const applyAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('zerocraftr_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API error', error);
      return Promise.reject(error);
    }
  );
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1'
});

const apiV2 = axios.create({
  baseURL: import.meta.env.VITE_API_V2_URL ?? '/api/v2'
});

applyAuthInterceptor(api);
applyAuthInterceptor(apiV2);

export interface ForecastPoint {
  timestamp: string;
  prediction: number;
  lower: number;
  upper: number;
  components: Record<string, number>;
}

export interface TelemetryPoint {
  timestamp: string;
  energy_kwh: number;
}

export interface ForecastResponse {
  site_id: number;
  horizon_hours: number;
  points: ForecastPoint[];
  metrics: Record<string, number>;
  recent_actuals: TelemetryPoint[];
}

export interface EquipmentConfigPayload {
  name: string;
  load_pct: number;
  runtime_hours: number;
  idle_hours: number;
}

export interface OptimizationResponse {
  site_id: number;
  objective: number;
  baseline_objective: number;
  savings_pct: number;
  energy_kwh: number;
  co2_kg: number;
  recommended: EquipmentConfigPayload[];
  generated_at: string;
}

export interface InsightResponse {
  site_id: number;
  insight: string;
  confidence: number;
  generated_at: string;
}

export interface RetrainResponse {
  site_id: number;
  forecast_mae: number;
  forecast_mape: number;
  optimization_objective: number;
}

export interface ModelRegistryEntry {
  model_name: string;
  version: string;
  accuracy?: number;
  path: string;
  created_at: string;
}

export const fetchCombinedForecast = async (
  siteId: number,
  horizonHours = 24,
  lookbackHours = 24 * 7
): Promise<ForecastResponse> => {
  const response = await apiV2.post<ForecastResponse>('/forecast/combined', {
    site_id: siteId,
    horizon_hours: horizonHours,
    lookback_hours: lookbackHours
  });
  return response.data;
};

export const requestOptimization = async (
  siteId: number,
  equipment: EquipmentConfigPayload[],
  lambdaWeight = 0.5
): Promise<OptimizationResponse> => {
  const response = await apiV2.post<OptimizationResponse>('/optimize', {
    site_id: siteId,
    lambda_weight: lambdaWeight,
    equipment
  });
  return response.data;
};

export interface InsightRequestPayload {
  site_id: number;
  energy_summary: string;
  forecast_summary: string;
  optimization_summary: string;
}

export const requestInsight = async (payload: InsightRequestPayload): Promise<InsightResponse> => {
  const response = await apiV2.post<InsightResponse>('/insights', payload);
  return response.data;
};

export const triggerRetrain = async (
  siteId: number,
  telemetry: TelemetryPoint[] = [],
  equipment: EquipmentConfigPayload[] = []
) => {
  const response = await apiV2.post<RetrainResponse>('/models/retrain', {
    site_id: siteId,
    telemetry: telemetry.length ? telemetry : undefined,
    equipment: equipment.length ? equipment : undefined
  });
  return response.data;
};

export const fetchModelRegistry = async (): Promise<ModelRegistryEntry[]> => {
  const response = await apiV2.get<{ models: ModelRegistryEntry[] }>('/models/list');
  return response.data.models;
};

export default api;
