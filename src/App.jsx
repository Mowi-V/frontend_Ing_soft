import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute';
import { ROLES } from './utils/constants';

// Vistas Públicas
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';

// Vistas Protegidas Cliente
import DashboardCliente from './pages/DashboardCliente';
import PerfilCliente from './pages/PerfilCliente';
import DetalleProveedor from './pages/DetalleProveedor';

// Vistas Protegidas Proveedor
import DashboardProveedor from './pages/DashboardProveedor';
import PerfilProveedor from './pages/PerfilProveedor';
import CrearServicio from './pages/CrearServicio';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/restablecer-password" element={<RestablecerPassword />} />

                {/* Rutas Protegidas: Rol Cliente ('C') */}
                <Route element={<ProtectedRoute rolPermitido={ROLES.CLIENTE} />}>
                    <Route path="/dashboard-cliente" element={<DashboardCliente />} />
                    <Route path="/perfil-cliente" element={<PerfilCliente />} />
                    <Route path="/proveedor/:id" element={<DetalleProveedor />} />
                </Route>

                {/* Rutas Protegidas: Rol Proveedor ('P') */}
                <Route element={<ProtectedRoute rolPermitido={ROLES.PROVEEDOR} />}>
                    <Route path="/dashboard-proveedor" element={<DashboardProveedor />} />
                    <Route path="/perfil-proveedor" element={<PerfilProveedor />} />
                    <Route path="/crear-servicio" element={<CrearServicio />} />
                </Route>

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}