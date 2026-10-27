import { apiClient } from './api.client';

export const solicitudesService = {
    // HU-012: Crear solicitud de servicio
    crearSolicitud: async (datos) => {
        return await apiClient('/solicitudes', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    // HU-013: Consultar mis solicitudes (Cliente)
    obtenerMisSolicitudesCliente: async () => {
        return await apiClient('/solicitudes/mias', {
            method: 'GET'
        });
    },

    // HU-014: Consultar solicitudes recibidas (Proveedor)
    obtenerSolicitudesProveedor: async () => {
        return await apiClient('/solicitudes/recibidas', {
            method: 'GET'
        });
    }
};