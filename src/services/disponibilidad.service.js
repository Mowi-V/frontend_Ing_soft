import { apiClient } from './api.client';

export const disponibilidadService = {
    obtenerMiDisponibilidad: async () => {
        return await apiClient('/disponibilidad/mi-agenda', {
            method: 'GET'
        });
    },

    obtenerDisponibilidadProveedor: async (idProveedor) => {
        return await apiClient(`/disponibilidad/proveedor/${idProveedor}`, {
            method: 'GET'
        });
    },

    agregarFranja: async (dia, hora_inicio, hora_fin) => {
        return await apiClient('/disponibilidad/franja', {
            method: 'POST',
            body: JSON.stringify({ dia, hora_inicio, hora_fin })
        });
    },

    eliminarFranja: async (idDisponibilidad) => {
        return await apiClient(`/disponibilidad/franja/${idDisponibilidad}`, {
            method: 'DELETE'
        });
    },

    agregarPeriodoNoDisponible: async (fecha_inicio, fecha_fin) => {
        return await apiClient('/disponibilidad/bloqueo', {
            method: 'POST',
            body: JSON.stringify({ fecha_inicio, fecha_fin })
        });
    },

    eliminarPeriodoNoDisponible: async (idPeriodo) => {
        return await apiClient(`/disponibilidad/bloqueo/${idPeriodo}`, {
            method: 'DELETE'
        });
    }
};