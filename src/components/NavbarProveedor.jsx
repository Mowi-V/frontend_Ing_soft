import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './NavbarProveedor.css';

export default function NavbarProveedor() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <header className="dash-prov-navbar">
            <div className="dash-prov-brand">
                <span className="dash-prov-brand-icon">▢</span>
                <Link to="/dashboard-proveedor" className="dash-prov-brand-title">
                    Bienestar en Casa <span className="dash-prov-tag">(Proveedor)</span>
                </Link>
            </div>

            <nav className="dash-prov-nav-items">
                <Link to="/dashboard-proveedor" className="dash-prov-nav-link">
                    Mis Servicios
                </Link>
                <Link to="/solicitudes-proveedor" className="dash-prov-nav-link">
                    Bandeja de Solicitudes
                </Link>
                <Link to="/agenda-proveedor" className="dash-prov-nav-link">
                    Mi Disponibilidad
                </Link>
                <Link to="/perfil-proveedor" className="dash-prov-user-link">
                    <span className="dash-prov-avatar"></span>
                    <span>Mi Cuenta</span>
                </Link>
                <button type="button" onClick={handleLogout} className="dash-prov-btn-logout">
                    Cerrar Sesión
                </button>
            </nav>
        </header>
    );
}