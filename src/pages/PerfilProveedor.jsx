import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
import './PerfilProveedor.css';

export default function PerfilProveedor() {
    const navigate = useNavigate();
    const [editando, setEditando] = useState(false);

    // Datos personales y profesionales
    const [correo, setCorreo] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [descripcionPerfil, setDescripcionPerfil] = useState('');

    // Zonas de atención registradas
    const [zonas, setZonas] = useState([]);

    // Selectores para añadir nueva zona
    const [ciudades, setCiudades] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
    const [barrioSeleccionado, setBarrioSeleccionado] = useState('');

    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Carga de datos iniciales
    useEffect(() => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        if (!token || rol !== 'P') {
            navigate('/login');
            return;
        }

        const cargarInformacion = async () => {
            try {
                // Diccionarios
                const resUbic = await fetch('/api/ubicaciones');
                const dataUbic = await resUbic.json();
                setCiudades(dataUbic.ciudades || []);

                // Perfil
                const resPerfil = await fetch('/api/proveedores/perfil', {
                    headers: { 'x-token': token }
                });

                if (resPerfil.status === 401) {
                    navigate('/login');
                    return;
                }

                const dataPerfil = await resPerfil.json();
                if (resPerfil.ok && dataPerfil.perfil) {
                    const p = dataPerfil.perfil;
                    setCorreo(p.correo_electronico || '');
                    setNombre(p.nombre || '');
                    setApellido(p.apellido || '');
                    setDescripcionPerfil(p.descripcion_perfil || '');
                    setZonas(p.zonas || []);
                }
            } catch (err) {
                console.error(err);
                setError('Error al consultar datos del proveedor');
            } finally {
                setCargando(false);
            }
        };

        cargarInformacion();
    }, [navigate]);

    // Filtrar barrios cuando cambia la ciudad en el formulario de zona
    const handleCiudadChange = (e) => {
        const idC = e.target.value;
        setCiudadSeleccionada(idC);
        setBarrioSeleccionado('');

        const ciudadObj = ciudades.find(c => c.id_ciudad === Number(idC));
        setBarriosDisponibles(ciudadObj ? ciudadObj.Barrios || [] : []);
    };

    // Guardar cambios del perfil personal
    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

        const token = localStorage.getItem('x-token');
        try {
            const res = await fetch('/api/proveedores/perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    descripcion_perfil: descripcionPerfil
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMensaje('Información profesional actualizada exitosamente.');
                localStorage.setItem('usuario_nombre', nombre);
                setEditando(false);
            } else {
                setError(data.msg || 'Error al actualizar el perfil.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al guardar cambios.');
        }
    };

    // Registrar nueva zona de atención (1 por barrio)
    const handleAgregarZona = async (e) => {
        e.preventDefault();
        if (!ciudadSeleccionada || !barrioSeleccionado) return;

        setError(null);
        setMensaje(null);
        const token = localStorage.getItem('x-token');

        try {
            const res = await fetch('/api/proveedores/zonas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token
                },
                body: JSON.stringify({
                    id_ciudad: parseInt(ciudadSeleccionada),
                    id_barrio: parseInt(barrioSeleccionado)
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Re-consultar perfil para refrescar lista con nombres relacionales
                const resPerfil = await fetch('/api/proveedores/perfil', {
                    headers: { 'x-token': token }
                });
                const dataActualizada = await resPerfil.json();
                setZonas(dataActualizada.perfil?.zonas || []);
                setBarrioSeleccionado('');
                setMensaje('Zona de atención agregada.');
            } else {
                setError(data.msg || 'No se pudo agregar la zona.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al agregar zona.');
        }
    };

    // Eliminar una zona de atención
    const handleEliminarZona = async (id_zona) => {
        setError(null);
        const token = localStorage.getItem('x-token');

        try {
            const res = await fetch(`/api/proveedores/zonas/${id_zona}`, {
                method: 'DELETE',
                headers: { 'x-token': token }
            });

            if (res.ok) {
                setZonas(prev => prev.filter(z => z.id_zona !== id_zona));
            } else {
                const data = await res.json();
                setError(data.msg || 'No se pudo eliminar la zona.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al eliminar zona.');
        }
    };

    // Agrupación de zonas por Ciudad para la vista
    const zonasAgrupadasPorCiudad = zonas.reduce((acc, zona) => {
        const nombreCiudad = zona.Ciudad?.nombre || 'Ciudad';
        if (!acc[nombreCiudad]) acc[nombreCiudad] = [];
        acc[nombreCiudad].push(zona);
        return acc;
    }, {});

    if (cargando) return <div className="perfil-cargando">Cargando perfil del profesional...</div>;

    return (
        <div className="perfil-proveedor-wrapper">
            <NavbarProveedor />

            <main className="perfil-container">
                {/* Cabecera idéntica al perfil del cliente */}
                <div className="perfil-header-card">
                    <div className="perfil-avatar-grande"></div>
                    <div>
                        <h2>Mi Cuenta (Proveedor)</h2>
                        <p className="perfil-subtexto">Consulta y administra tus credenciales profesionales y zonas de cobertura</p>
                    </div>
                </div>

                {/* TARJETA 1: INFORMACIÓN PROFESIONAL */}
                <div className="perfil-form-card">
                    <div className="perfil-top-actions">
                        <span className={`estado-edicion-badge ${editando ? 'modo-edicion' : 'modo-lectura'}`}>
                            {editando ? 'Modo Edición Activado' : 'Campos Bloqueados (Solo Lectura)'}
                        </span>

                        {!editando ? (
                            <button 
                                type="button" 
                                className="btn-activar-edicion" 
                                onClick={() => { setEditando(true); setMensaje(null); }}
                            >
                                ✏️ Actualizar campos
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                className="btn-cancelar-edicion" 
                                onClick={() => setEditando(false)}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    {mensaje && <div className="alerta-exito">{mensaje}</div>}
                    {error && <div className="alerta-error">{error}</div>}

                    <form onSubmit={handleGuardarPerfil}>
                        <div className="form-grupo">
                            <label>Correo Electrónico (No modificable):</label>
                            <input type="email" value={correo} disabled className="input-bloqueado" />
                        </div>

                        <div className="form-fila">
                            <div className="form-grupo">
                                <label>Nombre *:</label>
                                <input 
                                    type="text" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required 
                                />
                            </div>
                            <div className="form-grupo">
                                <label>Apellido *:</label>
                                <input 
                                    type="text" 
                                    value={apellido} 
                                    onChange={(e) => setApellido(e.target.value)} 
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Descripción del Perfil Profesional *:</label>
                            <textarea 
                                rows="3" 
                                value={descripcionPerfil} 
                                onChange={(e) => setDescripcionPerfil(e.target.value)} 
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                                placeholder="Indica tu especialidad, experiencia y enfoque de atención..."
                                required 
                            />
                        </div>

                        {editando && (
                            <div className="form-acciones">
                                <button type="submit" className="btn-guardar">💾 Guardar Cambios</button>
                            </div>
                        )}
                    </form>
                </div>

                {/* TARJETA 2: ZONAS GENERALES DE ATENCIÓN (HU-005) */}
                <div className="perfil-form-card" style={{ marginTop: '24px' }}>
                    <h3>Zonas Generales de Atención</h3>
                    <p className="perfil-subtexto" style={{ marginBottom: '18px' }}>
                        Informa las ciudades y barrios donde ofreces tus servicios. Esta información es orientativa para tus clientes.
                    </p>

                    {/* Formulario para añadir un nuevo barrio */}
                    <form className="zona-agregar-form" onSubmit={handleAgregarZona}>
                        <div className="form-fila">
                            <div className="form-grupo">
                                <label>Ciudad:</label>
                                <select value={ciudadSeleccionada} onChange={handleCiudadChange} required>
                                    <option value="">Selecciona una ciudad</option>
                                    {ciudades.map(c => (
                                        <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo">
                                <label>Barrio / Sector:</label>
                                <select 
                                    value={barrioSeleccionado} 
                                    onChange={(e) => setBarrioSeleccionado(e.target.value)} 
                                    disabled={!ciudadSeleccionada}
                                    required
                                >
                                    <option value="">Selecciona un barrio</option>
                                    {barriosDisponibles.map(b => (
                                        <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo btn-zona-col">
                                <label>&nbsp;</label>
                                <button type="submit" className="btn-agregar-zona">+ Añadir Barrio</button>
                            </div>
                        </div>
                    </form>

                    {/* Listado agrupado por Ciudad */}
                    <div className="zonas-lista-agrupada">
                        {Object.keys(zonasAgrupadasPorCiudad).length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Aún no has registrado zonas de atención.
                            </p>
                        ) : (
                            Object.entries(zonasAgrupadasPorCiudad).map(([ciudadNombre, barriosList]) => (
                                <div key={ciudadNombre} className="ciudad-grupo-box">
                                    <h4 className="ciudad-grupo-titulo">📍 {ciudadNombre}</h4>
                                    <div className="barrios-badges-container">
                                        {barriosList.map(z => (
                                            <span key={z.id_zona} className="barrio-badge">
                                                {z.Barrio?.nombre || 'Barrio'}
                                                <button 
                                                    type="button" 
                                                    className="btn-remover-barrio"
                                                    onClick={() => handleEliminarZona(z.id_zona)}
                                                    title="Eliminar barrio"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}