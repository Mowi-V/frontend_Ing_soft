import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    const handleCerrarSesion = () => {
        // Eliminar credenciales del navegador (HU-002)
        localStorage.removeItem('x-token');
        localStorage.removeItem('usuario_nombre');
        localStorage.removeItem('usuario_rol');

        // Redirección interna de React Router
        navigate('/login');
    };

    return (
        <header className="dash-navbar">
            <div className="dash-brand">
                <span className="dash-brand-icon">▢</span>
                <Link to="/dashboard-cliente" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="dash-brand-title">Bienestar en Casa</span>
                </Link>
            </div>

            <nav className="dash-nav-items">
                <Link to="/dashboard-cliente" className="dash-nav-link">
                    Explorar
                </Link>

                <Link to="/mis-solicitudes" className="dash-nav-link">
                    Mis Solicitudes
                </Link>

                <Link to="/perfil-cliente" className="dash-user-link">
                    <span className="dash-avatar"></span>
                    <span>Mi Cuenta</span>
                </Link>
                
                <button 
                    type="button" 
                    className="btn-logout-nav" 
                    onClick={handleCerrarSesion}
                >
                    Cerrar Sesión
                </button>
            </nav>
        </header>
    );
}