import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

export const apiClient = async (endpoint, options = {}) => {
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers,
        credentials: 'include' 
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem(STORAGE_KEYS.ROL);
                localStorage.removeItem(STORAGE_KEYS.USUARIO);
                if (window.location.pathname !== '/login' && window.location.pathname !== '/registro') {
                    window.location.href = '/login';
                }
            }

            const mensajeError =
                data.msg ||
                (data.errors && data.errors[0]?.msg) ||
                'Error al procesar la solicitud en el servidor';

            const error = new Error(mensajeError);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        throw err;
    }
};