import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ROLES } from '../utils/constants';

export default function ProtectedRoute({ rolPermitido }) {
    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState(false);
    const [rolUsuario, setRolUsuario] = useState(null);

    useEffect(() => {
        const validar = async () => {
            const usuario = await authService.verificarSesionServidor();
            if (usuario) {
                setAutenticado(true);
                setRolUsuario(usuario.rol);
            } else {
                setAutenticado(false);
            }
            setCargando(false);
        };
        validar();
    }, []);

    if (cargando) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Verificando sesión segura...</div>;
    }

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    if (rolPermitido && rolUsuario !== rolPermitido) {
        const destino = rolUsuario === ROLES.PROVEEDOR 
            ? '/dashboard-proveedor' 
            : '/dashboard-cliente';
        return <Navigate to={destino} replace />;
    }

    return <Outlet />;
}