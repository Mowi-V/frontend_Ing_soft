import { apiClient } from './api.client';

export const ubicacionesService = {
    
    obtenerUbicaciones: async () => {
        const data = await apiClient('/ubicaciones', {
            method: 'GET'
        });

        const lista = data?.comunas || data?.ciudades || (Array.isArray(data) ? data : []);

        
        return lista.map(c => {
            const coleccionBarrios = c.Barrios || c.barrios || [];
            return {
                ...c,
                Barrios: coleccionBarrios,
                barrios: coleccionBarrios
            };
        });
    }
};