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

    cambiarEstadoServicio: async (idServicio, estado) => {
        return await apiClient(`/servicios/${idServicio}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado })
        });
    },

    obtenerInsumos: async (idServicio) => {
        return await apiClient(`/servicios/${idServicio}/insumos`, {
            method: 'GET'
        });
    },

    agregarInsumo: async (idServicio, nombre) => {
        return await apiClient(`/servicios/${idServicio}/insumos`, {
            method: 'POST',
            body: JSON.stringify({ nombre })
        });
    },

    eliminarInsumo: async (idServicio, idInsumo) => {
        return await apiClient(`/servicios/${idServicio}/insumos/${idInsumo}`, {
            method: 'DELETE'
        });
    },

    obtenerRecursos: async (idServicio) => {
        return await apiClient(`/servicios/${idServicio}/recursos`, {
            method: 'GET'
        });
    },

    subirRecursoMultimedia: async (idServicio, formData) => {
        return await apiClient(`/servicios/${idServicio}/recursos`, {
            method: 'POST',
            body: formData
        });
    },

    eliminarRecursoMultimedia: async (idServicio, idRecurso) => {
        return await apiClient(`/servicios/${idServicio}/recursos/${idRecurso}`, {
            method: 'DELETE'
        });
    }
};