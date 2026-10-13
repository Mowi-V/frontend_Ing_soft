import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './NavbarProveedor.css';

export default function NavbarProveedor() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('Proveedor');

    useEffect(() => {
        const u = authService.getUsuario();
        if (u && u.nombre) setNombre(u.nombre);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="prov-navbar">
            <div className="prov-brand">
                <span className="prov-brand-box">▢</span>
                <Link to="/dashboard-proveedor" className="prov-brand-title">
                    Bienestar en Casa
                </Link>
            </div>

            <div className="prov-search-container">
                <span className="prov-search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Buscar servicios o solicitudes..." 
                    className="prov-search-input"
                />
            </div>

            <nav className="prov-nav-items">
                <Link to="/dashboard-proveedor" className="prov-nav-link">
                    Mis Servicios ({nombre})
                </Link>
                
                <Link to="/perfil-proveedor" className="prov-user-link">
                    <span className="prov-avatar"></span>
                    <span>Mi Cuenta</span>
                </Link>

                <button type="button" className="btn-logout-prov" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </nav>
        </header>
    );
}