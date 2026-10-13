import { apiClient } from './api.client';

export const ubicacionesService = {
    obtenerUbicaciones: async () => {
        const data = await apiClient('/ubicaciones', {
            method: 'GET'
        });
        return data.ciudades || [];
    }
};