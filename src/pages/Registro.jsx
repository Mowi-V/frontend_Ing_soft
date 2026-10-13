import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import { ROLES } from '../utils/constants';
import './Registro.css';

export default function Registro() {
    const navigate = useNavigate();
    const [ciudades, setCiudades] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        correo_electronico: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: ROLES.CLIENTE,
        id_ciudad: '',
        id_barrio: '',
        direccion: '',
        informacion_complementaria: '',
        descripcion_perfil: ''
    });

    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                const data = await ubicacionesService.obtenerUbicaciones();
                setCiudades(data);
            } catch (err) {
                console.error('Error cargando ubicaciones:', err);
            }
        };
        cargarUbicaciones();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'id_ciudad') {
            const ciudadSel = ciudades.find(c => String(c.id_ciudad) === String(value));
            setBarriosDisponibles(ciudadSel ? ciudadSel.Barrios || [] : []);
            setForm(prev => ({ ...prev, id_ciudad: value, id_barrio: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.contrasena !== form.confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const payload = {
                nombre: form.nombre,
                apellido: form.apellido,
                correo_electronico: form.correo_electronico,
                contrasena: form.contrasena,
                rol: form.rol,
                ...(form.rol === ROLES.CLIENTE && {
                    id_ciudad: parseInt(form.id_ciudad, 10),
                    id_barrio: parseInt(form.id_barrio, 10),
                    direccion: form.direccion,
                    informacion_complementaria: form.informacion_complementaria
                }),
                ...(form.rol === ROLES.PROVEEDOR && {
                    descripcion_perfil: form.descripcion_perfil
                })
            };

            await authService.registro(payload);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1 className="register-title">Crear cuenta</h1>

                {error && <div className="register-error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-field">
                        <label htmlFor="rol">Quiero registrarme como</label>
                        <select
                            id="rol"
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                        >
                            <option value={ROLES.CLIENTE}>Cliente</option>
                            <option value={ROLES.PROVEEDOR}>Proveedor</option>
                        </select>
                    </div>

                    <div className="register-row">
                        <div className="register-field">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="register-field">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="correo">Correo</label>
                        <input
                            id="correo"
                            type="email"
                            name="correo_electronico"
                            value={form.correo_electronico}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="register-row">
                        <div className="register-field">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input
                                id="contrasena"
                                type="password"
                                name="contrasena"
                                value={form.contrasena}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="register-field">
                            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
                            <input
                                id="confirmarContrasena"
                                type="password"
                                name="confirmarContrasena"
                                value={form.confirmarContrasena}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {form.rol === ROLES.CLIENTE && (
                        <div className="register-extra-section">
                            <div className="register-row">
                                <div className="register-field">
                                    <label htmlFor="ciudad">Ciudad</label>
                                    <select
                                        id="ciudad"
                                        name="id_ciudad"
                                        value={form.id_ciudad}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione ciudad...</option>
                                        {ciudades.map(c => (
                                            <option key={c.id_ciudad} value={c.id_ciudad}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="register-field">
                                    <label htmlFor="barrio">Barrio / Sector</label>
                                    <select
                                        id="barrio"
                                        name="id_barrio"
                                        value={form.id_barrio}
                                        onChange={handleChange}
                                        disabled={!form.id_ciudad}
                                        required
                                    >
                                        <option value="">Seleccione barrio...</option>
                                        {barriosDisponibles.map(b => (
                                            <option key={b.id_barrio} value={b.id_barrio}>
                                                {b.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="register-field">
                                <label htmlFor="direccion">Dirección</label>
                                <input
                                    id="direccion"
                                    type="text"
                                    name="direccion"
                                    placeholder="Ej. Calle 123 # 45-67"
                                    value={form.direccion}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="infoComp">Información complementaria</label>
                                <textarea
                                    id="infoComp"
                                    name="informacion_complementaria"
                                    rows="2"
                                    placeholder="Apto, torre, indicaciones..."
                                    value={form.informacion_complementaria}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {form.rol === ROLES.PROVEEDOR && (
                        <div className="register-extra-section">
                            <div className="register-field">
                                <label htmlFor="descripcionPerfil">Descripción profesional</label>
                                <textarea
                                    id="descripcionPerfil"
                                    name="descripcion_perfil"
                                    rows="3"
                                    placeholder="Especialidad, experiencia o servicios que ofreces..."
                                    value={form.descripcion_perfil}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="register-button" disabled={cargando}>
                        {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="register-links">
                    <p className="register-login-text">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="register-login-link">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}