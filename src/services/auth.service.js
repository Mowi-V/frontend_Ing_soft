
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

        if (data.token) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.ROL, data.usuario.rol);
            localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));
        }
        return data;
    },

    
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ROL);
        localStorage.removeItem(STORAGE_KEYS.USUARIO);
        window.location.href = '/login';
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
        return Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN));
    },

    getRol: () => {
        return localStorage.getItem(STORAGE_KEYS.ROL);
    },

    getUsuario: () => {
        const raw = localStorage.getItem(STORAGE_KEYS.USUARIO);
        return raw ? JSON.parse(raw) : null;
    }
};