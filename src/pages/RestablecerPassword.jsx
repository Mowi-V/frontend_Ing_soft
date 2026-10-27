import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './RestablecerPassword.css';

export default function RestablecerPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token') || '';

    // Estados del ciclo de vida de validación
    const [verificando, setVerificando] = useState(true);
    const [tokenValido, setTokenValido] = useState(false);
    const [errorValidacion, setErrorValidacion] = useState(null);

    // Estados del formulario de nueva clave
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState(null);
    const [errorFormulario, setErrorFormulario] = useState(null);

    useEffect(() => {
        const comprobarEnlace = async () => {
            if (!token) {
                setErrorValidacion('No se proporcionó ningún token de recuperación en el enlace.');
                setTokenValido(false);
                setVerificando(false);
                return;
            }

            try {
                await authService.verificarTokenRecuperacion(token);
                setTokenValido(true);
            } catch (err) {
                setErrorValidacion(err.message || 'El enlace no es válido o ha caducado.');
                setTokenValido(false);
            } finally {
                setVerificando(false);
            }
        };

        comprobarEnlace();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorFormulario(null);

        if (nuevaContrasena.length < 6) {
            setErrorFormulario('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            setErrorFormulario('Las contraseñas no coinciden.');
            return;
        }

        setGuardando(true);
        try {
            const data = await authService.restablecerPassword(token, nuevaContrasena);
            setMensajeExito(data.msg || 'Contraseña actualizada con éxito.');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setErrorFormulario(err.message || 'Error al restablecer la contraseña.');
        } finally {
            setGuardando(false);
        }
    };

    // 1. Estado de carga: verificando autenticidad del token
    if (verificando) {
        return (
            <div className="restablecer-page">
                <div className="restablecer-card">
                    <h1 className="restablecer-title">Verificando enlace...</h1>
                    <p className="restablecer-subtexto">Comprobando la seguridad y vigencia de la solicitud.</p>
                </div>
            </div>
        );
    }

    // 2. Estado de error: token inválido, expirado o ya utilizado
    if (!tokenValido) {
        return (
            <div className="restablecer-page">
                <div className="restablecer-card">
                    <h1 className="restablecer-title">Enlace no disponible</h1>
                    <div className="restablecer-error-msg">{errorValidacion}</div>
                    <p className="restablecer-subtexto">
                        Por motivos de seguridad, los enlaces de recuperación expiran y solo pueden utilizarse una única vez.
                    </p>
                    <div className="restablecer-links-bloque">
                        <Link to="/recuperar-password" className="restablecer-button-link">
                            Solicitar un nuevo enlace
                        </Link>
                        <Link to="/login" className="restablecer-link-secundario">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Estado listo: token válido, renderizado del formulario
    return (
        <div className="restablecer-page">
            <div className="restablecer-card">
                <h1 className="restablecer-title">Nueva contraseña</h1>
                <p className="restablecer-subtexto">Ingresa tu nueva clave de acceso.</p>

                {mensajeExito && <div className="restablecer-exito-msg">{mensajeExito}</div>}
                {errorFormulario && <div className="restablecer-error-msg">{errorFormulario}</div>}

                <form onSubmit={handleSubmit} className="restablecer-form">
                    <div className="restablecer-field">
                        <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
                        <input
                            id="nuevaContrasena"
                            type="password"
                            value={nuevaContrasena}
                            onChange={(e) => setNuevaContrasena(e.target.value)}
                            minLength={6}
                            required
                            disabled={guardando || Boolean(mensajeExito)}
                        />
                    </div>

                    <div className="restablecer-field">
                        <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                        <input
                            id="confirmarContrasena"
                            type="password"
                            value={confirmarContrasena}
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            minLength={6}
                            required
                            disabled={guardando || Boolean(mensajeExito)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="restablecer-button" 
                        disabled={guardando || Boolean(mensajeExito)}
                    >
                        {guardando ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                </form>

                <div className="restablecer-links">
                    <Link to="/login" className="restablecer-link">
                        Ir al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}