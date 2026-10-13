import { apiClient } from './api.client';

export const serviciosService = {
    listarCatalogo: async (categoria = 'Todos') => {
        const endpoint = categoria === 'Todos' 
            ? '/servicios' 
            : `/servicios?categoria=${encodeURIComponent(categoria)}`;
        return await apiClient(endpoint, {
            method: 'GET'
        });
    },

    obtenerMisServicios: async () => {
        return await apiClient('/servicios/mis-servicios', {
            method: 'GET'
        });
    },

    crearServicio: async (datosServicio) => {
        return await apiClient('/servicios', {
            method: 'POST',
            body: JSON.stringify(datosServicio)
        });
    },

    actualizarServicio: async (idServicio, datosActualizados) => {
        return await apiClient(`/servicios/${idServicio}`, {
            method: 'PUT',
            body: JSON.stringify(datosActualizados)
        });
    },

    subirRecursoMultimedia: async (idServicio, formData) => {
        return await apiClient(`/recursos/servicios/${idServicio}`, {
            method: 'POST',
            body: formData
        });
    }
};