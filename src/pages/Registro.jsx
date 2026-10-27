import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import './Registro.css';

export default function Registro() {
    const navigate = useNavigate();

    const [rol, setRol] = useState('cliente');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');

    // Campos de Cliente (Comuna y Barrio en Cali)
    const [comunas, setComunas] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);
    const [idComuna, setIdComuna] = useState('');
    const [idBarrio, setIdBarrio] = useState('');
    const [direccion, setDireccion] = useState('');
    const [informacionComplementaria, setInformacionComplementaria] = useState('');

    // Campo de Proveedor
    const [descripcionProfesional, setDescripcionProfesional] = useState('');

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                const listaComunas = await ubicacionesService.obtenerUbicaciones();
                setComunas(listaComunas || []);
            } catch (err) {
                console.error('Error al cargar comunas y barrios:', err);
            }
        };
        cargarUbicaciones();
    }, []);

    const handleComunaChange = (e) => {
        const comunaSeleccionada = e.target.value;
        setIdComuna(comunaSeleccionada);
        setIdBarrio('');

        const comunaObj = comunas.find(c => String(c.id_comuna) === String(comunaSeleccionada));
        setBarriosDisponibles(comunaObj ? comunaObj.Barrios || [] : []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        const payload = {
            nombre,
            apellido,
            correo_electronico: correo,
            contrasena: password,
            rol
        };

        if (rol === 'cliente') {
            payload.id_barrio = parseInt(idBarrio, 10);
            payload.direccion = direccion;
            payload.informacion_complementaria = informacionComplementaria;
        } else {
            payload.descripcion_perfil = descripcionProfesional;
        }

        setCargando(true);
        try {
            await authService.registro(payload);
            alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Error al registrar la cuenta');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="registro-page">
            <div className="registro-card">
                <h1 className="registro-title">Crear cuenta</h1>

                {error && <div className="registro-error-msg">{error}</div>}

                <form className="registro-form" onSubmit={handleSubmit}>
                    <div className="registro-field">
                        <label>Tipo de cuenta</label>
                        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                            <option value="cliente">Cliente (Solicitar servicios)</option>
                            <option value="proveedor">Proveedor (Ofrecer servicios)</option>
                        </select>
                    </div>

                    <div className="registro-row">
                        <div className="registro-field">
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="registro-field">
                            <label>Apellido</label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="registro-field">
                        <label>Correo</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="registro-row">
                        <div className="registro-field">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>
                        <div className="registro-field">
                            <label>Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    {rol === 'cliente' ? (
                        <>
                            <div className="registro-row">
                                <div className="registro-field">
                                    <label>Comuna (Cali)</label>
                                    <select value={idComuna} onChange={handleComunaChange} required>
                                        <option value="">Seleccione comuna...</option>
                                        {comunas.map((c) => (
                                            <option key={c.id_comuna} value={c.id_comuna}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="registro-field">
                                    <label>Barrio / Sector</label>
                                    <select
                                        value={idBarrio}
                                        onChange={(e) => setIdBarrio(e.target.value)}
                                        disabled={!idComuna}
                                        required
                                    >
                                        <option value="">Seleccione barrio...</option>
                                        {barriosDisponibles.map((b) => (
                                            <option key={b.id_barrio} value={b.id_barrio}>
                                                {b.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="registro-field">
                                <label>Dirección principal</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Calle 13 # 80-45"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="registro-field">
                                <label>Información complementaria (Opcional)</label>
                                <textarea
                                    rows="2"
                                    placeholder="Ej: Torre 2 Apto 301..."
                                    value={informacionComplementaria}
                                    onChange={(e) => setInformacionComplementaria(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="registro-field">
                            <label>Descripción profesional</label>
                            <textarea
                                rows="3"
                                placeholder="Describe tu experiencia, especialidades y certificaciones..."
                                value={descripcionProfesional}
                                onChange={(e) => setDescripcionProfesional(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="registro-button" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="registro-links">
                    <p className="registro-login-text">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="registro-login-link">
                            Iniciá sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}