import { apiClient } from './api.client';

export const clientesService = {
    
    obtenerPerfil: async () => {
        return await apiClient('/clientes/perfil', {
            method: 'GET'
        });
    },

    actualizarPerfil: async (datos) => {
        return await apiClient('/clientes/perfil', {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    }
};