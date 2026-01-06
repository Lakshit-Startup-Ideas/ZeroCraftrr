import api from './api';

export const fetchDevices = async () => {
    const response = await api.get('/devices');
    return response.data;
};

export const fetchTelemetry = async (params?: Record<string, unknown>) => {
    const response = await api.get('/telemetry', { params: { limit: 20, ...params } });
    return response.data;
};

export const fetchTelemetryAggregate = async () => {
    const response = await api.get('/telemetry/aggregate');
    return response.data;
};

export const fetchHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};
