import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ROLES } from '../utils/constants';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [credenciales, setCredenciales] = useState({
        correo_electronico: '',
        contrasena: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const comprobarSesion = async () => {
            const usuario = await authService.verificarSesionServidor();
            if (usuario) {
                navigate(usuario.rol === ROLES.PROVEEDOR ? '/dashboard-proveedor' : '/dashboard-cliente', { replace: true });
            }
        };
        comprobarSesion();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(null);

        try {
            const data = await authService.login(credenciales);
            const rol = data.usuario?.rol;
            navigate(rol === ROLES.PROVEEDOR ? '/dashboard-proveedor' : '/dashboard-cliente');
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Iniciar sesión</h1>

                {error && <div className="login-error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="correo">Correo</label>
                        <input
                            id="correo"
                            type="email"
                            name="correo_electronico"
                            value={credenciales.correo_electronico}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            id="contrasena"
                            type="password"
                            name="contrasena"
                            value={credenciales.contrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/recuperar-password" className="login-link">
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <p className="login-register-text">
                        ¿No tenés cuenta?{' '}
                        <Link to="/registro" className="login-register-link">
                            Registrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}