import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <header className="client-navbar">
            <div className="client-brand">
                <span className="client-brand-icon">▢</span>
                <Link to="/dashboard-cliente" className="client-brand-title">
                    Bienestar en Casa
                </Link>
            </div>

            <nav className="client-nav-items">
                <Link to="/dashboard-cliente" className="client-nav-link">
                    Explorar Servicios
                </Link>
                <Link to="/mis-solicitudes" className="client-nav-link">
                    Mis Citas
                </Link>
                <Link to="/perfil-cliente" className="client-user-link">
                    <span className="client-avatar"></span>
                    <span>Mi Perfil</span>
                </Link>
                <button type="button" onClick={handleLogout} className="btn-logout-client">
                    Cerrar Sesión
                </button>
            </nav>
        </header>
    );
}