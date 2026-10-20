import { apiClient } from './api.client';

export const proveedoresService = {
    obtenerMiPerfil: async () => {
        return await apiClient('/proveedores/perfil', {
            method: 'GET'
        });
    },

    actualizarMiPerfil: async (datos) => {
        return await apiClient('/proveedores/perfil', {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    },

    agregarZona: async (id_comuna, id_barrio) => {
        return await apiClient('/proveedores/zonas', {
            method: 'POST',
            body: JSON.stringify({ id_comuna, id_barrio })
        });
    },

    eliminarZona: async (id_zona) => {
        return await apiClient(`/proveedores/zonas/${id_zona}`, {
            method: 'DELETE'
        });
    },

    listarProveedores: async (buscar = '') => {
        const query = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
        return await apiClient(`/proveedores${query}`, {
            method: 'GET'
        });
    },

    
    obtenerDetalleProveedor: async (idProveedor) => {
        return await apiClient(`/proveedores/${idProveedor}`, {
            method: 'GET'
        });
    }
};