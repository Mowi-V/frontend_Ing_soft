import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

export const apiClient = async (endpoint, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { [STORAGE_KEYS.TOKEN]: token }),
        ...options.headers
    };


    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 && token) {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ROL);
                localStorage.removeItem(STORAGE_KEYS.USUARIO);
                window.location.href = '/login';
            }

            const error = new Error(
                data.msg || (data.errors && data.errors[0]?.msg) || 'Error en la petición'
            );
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        throw err;
    }
};