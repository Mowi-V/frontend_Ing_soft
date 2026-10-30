import { apiClient } from './api.client';

export const solicitudesService = {
    crearSolicitud: async (datos) => {
        return await apiClient('/solicitudes', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    obtenerMisSolicitudesCliente: async (estado = 'TODOS') => {
        const query = estado && estado !== 'TODOS' ? `?estado=${encodeURIComponent(estado)}` : '';
        return await apiClient(`/solicitudes/mias${query}`, {
            method: 'GET'
        });
    },

    obtenerDetalleSolicitud: async (idSolicitud) => {
        return await apiClient(`/solicitudes/${idSolicitud}`, {
            method: 'GET'
        });
    },

    obtenerSolicitudesProveedor: async (estado = 'TODOS') => {
        const query = estado && estado !== 'TODOS' ? `?estado=${encodeURIComponent(estado)}` : '';
        return await apiClient(`/solicitudes/recibidas${query}`, {
            method: 'GET'
        });
    },

    obtenerDetalleSolicitudProveedor: async (idSolicitud) => {
        return await apiClient(`/solicitudes/recibidas/${idSolicitud}`, {
            method: 'GET'
        });
    }
};