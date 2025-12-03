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
    // Placeholder if we had a /users/me endpoint, or decode token
    return { name: 'Admin User' };
};
