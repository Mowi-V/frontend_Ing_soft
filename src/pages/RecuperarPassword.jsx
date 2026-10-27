import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './RecuperarPassword.css';

export default function RecuperarPassword() {
    const [correo, setCorreo] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        setMensaje(null);

        try {
            const data = await authService.solicitarRecuperacion(correo);
            setMensaje(data.msg || 'Se ha enviado un enlace de recuperación a tu correo electrónico.');
        } catch (err) {
            setError(err.message || 'Error al solicitar la recuperación');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="recuperar-page">
            <div className="recuperar-card">
                <h1 className="recuperar-title">Recuperar contraseña</h1>
                <p className="recuperar-subtexto">
                    Ingresa tu correo y te enviaremos las instrucciones para restablecer tu cuenta.
                </p>

                {mensaje && <div className="recuperar-exito-msg">{mensaje}</div>}
                {error && <div className="recuperar-error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="recuperar-form">
                    <div className="recuperar-field">
                        <label htmlFor="correo">Correo registrado</label>
                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <button type="submit" className="recuperar-button" disabled={cargando}>
                        {cargando ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <div className="recuperar-links">
                    <Link to="/login" className="recuperar-link">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}