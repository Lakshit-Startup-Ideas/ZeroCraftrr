import api from './api';

export const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login/access-token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

export const getMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const [, payload] = token.split('.');
        const decoded = JSON.parse(atob(payload));
        if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
            return null;
        }
    } catch (err) {
        // malformed token; clear it
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:logout'));
        return null;
    }

    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
            return null;
        }
        throw error;
    }
};
