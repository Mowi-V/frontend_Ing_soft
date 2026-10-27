import { apiClient } from './api.client';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
    registro: async (datosRegistro) => {
        return await apiClient('/usuarios/registro', {
            method: 'POST',
            body: JSON.stringify(datosRegistro)
        });
    },

    login: async (credenciales) => {
        const data = await apiClient('/usuarios/login', {
            method: 'POST',
            body: JSON.stringify(credenciales)
        });


        if (data.usuario) {
            localStorage.setItem(STORAGE_KEYS.ROL, data.usuario.rol);
            localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
        }
        return data;
    },

    logout: async () => {
        try {
            await apiClient('/usuarios/logout', { method: 'POST' });
        } catch (error) {
            console.error('Error al notificar logout al servidor:', error);
        } finally {
            localStorage.removeItem(STORAGE_KEYS.ROL);
            localStorage.removeItem(STORAGE_KEYS.USUARIO);
            localStorage.removeItem(STORAGE_KEYS.TOKEN); 
            window.location.href = '/login';
        }
    },

    verificarSesionServidor: async () => {
        try {
            const data = await apiClient('/usuarios/verificar-sesion', { method: 'GET' });
            if (data.usuario) {
                localStorage.setItem(STORAGE_KEYS.ROL, data.usuario.rol);
                localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
                return data.usuario;
            }
            return null;
        } catch {
            return null;
        }
    },

    solicitarRecuperacion: async (correo_electronico) => {
        return await apiClient('/recuperacion/solicitar', {
            method: 'POST',
            body: JSON.stringify({ correo_electronico })
        });
    },

    restablecerPassword: async (token, nueva_contrasena) => {
        return await apiClient('/recuperacion/restablecer', {
            method: 'POST',
            body: JSON.stringify({ token, nueva_contrasena })
        });
    },

    isAuthenticated: () => {
        return Boolean(localStorage.getItem(STORAGE_KEYS.ROL));
    },

    getRol: () => {
        return localStorage.getItem(STORAGE_KEYS.ROL);
    },

    getUsuario: () => {
        const raw = localStorage.getItem(STORAGE_KEYS.USUARIO);
        return raw ? JSON.parse(raw) : null;
    },
    
    verificarTokenRecuperacion: async (token) => {
    return await apiClient(`/recuperacion/verificar/${encodeURIComponent(token)}`, {
        method: 'GET'
    });
},
};