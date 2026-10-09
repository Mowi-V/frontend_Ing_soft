import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavbarProveedor.css';

export default function NavbarProveedor() {
    const [nombre, setNombre] = useState('Proveedor');
    const navigate = useNavigate();

    useEffect(() => {
        const nombreGuardado = localStorage.getItem('usuario_nombre');
        if (nombreGuardado) setNombre(nombreGuardado);
    }, []);

    const handleCerrarSesion = () => {
        // Eliminar credenciales del navegador (HU-002)
        localStorage.removeItem('x-token');
        localStorage.removeItem('usuario_nombre');
        localStorage.removeItem('usuario_rol');

        // Redirección interna de React Router
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

            <nav className="prov-nav-items">
                <Link to="/solicitudes-proveedor" className="prov-nav-link">
                    Panel Proveedor ({nombre})
                </Link>
                
                <Link to="/perfil-proveedor" className="prov-user-link">
                    <span className="prov-avatar"></span>
                    <span>Mi cuenta</span>
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