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
            // El backend siempre responde mensaje neutro para no revelar cuentas
            setMensaje(data.msg || 'Si el correo está registrado, recibirás un enlace de recuperación.');
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="recuperar-container">
            <form className="recuperar-form" onSubmit={handleSubmit}>
                <h2>Recuperar Contraseña</h2>
                <p>Ingresa tu correo registrado para recibir un enlace temporal.</p>

                {mensaje && <div className="alerta-exito">{mensaje}</div>}
                {error && <div className="alerta-error">{error}</div>}

                <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input 
                        type="email" 
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="tu_correo@ejemplo.com"
                        required 
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Enviando...' : 'Enviar enlace'}
                </button>

                <div className="recuperar-links">
                    <Link to="/login">← Volver al inicio de sesión</Link>
                </div>
            </form>
        </div>
    );
}