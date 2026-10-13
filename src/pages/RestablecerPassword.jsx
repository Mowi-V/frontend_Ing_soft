import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './RestablecerPassword.css';

export default function RestablecerPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('El enlace de recuperación es inválido o no contiene un token.');
            return;
        }

        if (nuevaContrasena !== confirmar) {
            setError('Las contraseñas ingresadas no coinciden.');
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const data = await authService.restablecerPassword(token, nuevaContrasena);
            setMensaje(data.msg || 'Contraseña actualizada con éxito. Redirigiendo al login...');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="restablecer-container">
            <form className="restablecer-form" onSubmit={handleSubmit}>
                <h2>Restablecer Contraseña</h2>
                <p>Escribe tu nueva clave de acceso.</p>

                {mensaje && <div className="alerta-exito">{mensaje}</div>}
                {error && <div className="alerta-error">{error}</div>}

                <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input 
                        type="password" 
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input 
                        type="password" 
                        value={confirmar}
                        onChange={(e) => setConfirmar(e.target.value)}
                        placeholder="Repite la contraseña"
                        required 
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>

                <div className="restablecer-links">
                    <Link to="/login">← Cancelar y volver al login</Link>
                </div>
            </form>
        </div>
    );
}