import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ROLES } from '../utils/constants';

export default function ProtectedRoute({ rolPermitido }) {
    const autenticado = authService.isAuthenticated();
    const rolUsuario = authService.getRol();

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