import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="client-navbar">
            <div className="client-brand">
                <span className="client-brand-box">▢</span>
                <Link to="/dashboard-cliente" className="client-brand-title">
                    Bienestar en Casa
                </Link>
            </div>

            <nav className="client-nav-items">
                <Link to="/dashboard-cliente" className="client-nav-link">
                    Explorar
                </Link>
                <Link to="/mis-solicitudes" className="client-nav-link">
                    Mis Solicitudes
                </Link>
                <Link to="/perfil-cliente" className="client-user-link">
                    <span className="client-avatar"></span>
                    <span>Mi Cuenta</span>
                </Link>
                <button type="button" className="btn-logout-client" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </nav>
        </header>
    );
}