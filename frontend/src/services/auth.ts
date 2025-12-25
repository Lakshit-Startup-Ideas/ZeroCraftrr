import api from './api';

export interface RegisterPayload {
    email: string;
    password: string;
    full_name?: string;
}

export const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login/access-token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
};

export const register = async (payload: RegisterPayload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
};

export const fetchMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};
