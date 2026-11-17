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
    },

    aceptarSolicitud: async (idSolicitud) => {
        return await apiClient(`/solicitudes/${idSolicitud}/aceptar`, {
            method: 'PATCH'
        });
    },

    rechazarSolicitud: async (idSolicitud, motivo_rechazo_cancelacion) => {
        return await apiClient(`/solicitudes/${idSolicitud}/rechazar`, {
            method: 'PATCH',
            body: JSON.stringify({ motivo_rechazo_cancelacion })
        });
    },

    contraproponerSolicitud: async (idSolicitud, fecha_hora_sugerida) => {
        return await apiClient(`/solicitudes/${idSolicitud}/contraproponer`, {
            method: 'PATCH',
            body: JSON.stringify({ fecha_hora_sugerida })
        });
    }
};