import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './PerfilCliente.css';

export default function PerfilCliente() {
    // Estado para controlar si los campos están bloqueados o editables
    const [editando, setEditando] = useState(false);

    // Estados para los datos del cliente
    const [correo, setCorreo] = useState(''); // Solo lectura permanente
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [idCiudad, setIdCiudad] = useState('');
    const [idBarrio, setIdBarrio] = useState('');
    const [direccion, setDireccion] = useState('');
    const [infoComplementaria, setInfoComplementaria] = useState('');

    // Catálogos del diccionario de ubicaciones
    const [ciudades, setCiudades] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);

    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);

    // 1. Cargar datos del perfil y diccionarios al montar el componente
    useEffect(() => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        // Protección de ruta: Rol Cliente y Token requerido (HU-002 / HU-004)
        if (!token || rol !== 'C') {
            window.location.href = '/login';
            return;
        }

        const cargarDatos = async () => {
            try {
                // Consultar ubicaciones (ciudades y barrios)
                const resUbicaciones = await fetch('/api/ubicaciones');
                const dataUbicaciones = await resUbicaciones.json();
                const listaCiudades = dataUbicaciones.ciudades || [];
                setCiudades(listaCiudades);

                // Consultar perfil del cliente
                const resPerfil = await fetch('/api/clientes/perfil', {
                    headers: { 'x-token': token }
                });

                if (resPerfil.status === 401) {
                    localStorage.removeItem('x-token');
                    window.location.href = '/login';
                    return;
                }

                const dataPerfil = await resPerfil.json();
                if (resPerfil.ok && dataPerfil.perfil) {
                    const p = dataPerfil.perfil;
                    setCorreo(p.correo_electronico || '');
                    setNombre(p.nombre || '');
                    setApellido(p.apellido || '');
                    setIdCiudad(p.id_ciudad ? String(p.id_ciudad) : '');
                    setIdBarrio(p.id_barrio ? String(p.id_barrio) : '');
                    setDireccion(p.direccion || '');
                    setInfoComplementaria(p.informacion_complementaria || '');

                    // Filtrar barrios de la ciudad actual del cliente
                    if (p.id_ciudad) {
                        const ciudadEncontrada = listaCiudades.find(c => c.id_ciudad === Number(p.id_ciudad));
                        if (ciudadEncontrada) setBarriosDisponibles(ciudadEncontrada.Barrios || []);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Error al conectar con el servidor.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    // Manejar el cambio dinámico de ciudad para actualizar la lista de barrios
    const handleCiudadChange = (e) => {
        const nuevaCiudadId = e.target.value;
        setIdCiudad(nuevaCiudadId);
        setIdBarrio(''); // Resetear barrio al cambiar ciudad

        const ciudadEncontrada = ciudades.find(c => c.id_ciudad === Number(nuevaCiudadId));
        setBarriosDisponibles(ciudadEncontrada ? ciudadEncontrada.Barrios || [] : []);
    };

    // 2. Enviar actualización a la API (HU-004)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

        // Validar campos obligatorios en frontend
        if (!nombre || !apellido || !idCiudad || !idBarrio || !direccion) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        const token = localStorage.getItem('x-token');

        const payload = {
            nombre,
            apellido,
            id_ciudad: parseInt(idCiudad),
            id_barrio: parseInt(idBarrio),
            direccion,
            informacion_complementaria: infoComplementaria
        };

        try {
            const respuesta = await fetch('/api/clientes/perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token
                },
                body: JSON.stringify(payload)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setMensaje('Perfil actualizado correctamente.');
                localStorage.setItem('usuario_nombre', nombre); // Actualizar nombre local
                setEditando(false); // Volver a bloquear los campos tras guardar
            } else {
                setError(data.msg || 'Error al actualizar los datos.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al guardar los cambios.');
        }
    };

    if (cargando) {
        return <div className="perfil-cargando">Cargando información del perfil...</div>;
    }

    return (
        <div className="perfil-cliente-wrapper">
            {/* Navbar consistente */}
            <Navbar />

            <main className="perfil-container">
                <div className="perfil-header-card">
                    <div className="perfil-avatar-grande"></div>
                    <div>
                        <h2>Mi Cuenta</h2>
                        <p className="perfil-subtexto">Consulta y administra tus datos personales y dirección de atención</p>
                    </div>
                </div>

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

                    <form onSubmit={handleSubmit}>
                        {/* Campo No Modificable */}
                        <div className="form-grupo">
                            <label>Correo Electrónico (No modificable):</label>
                            <input 
                                type="email" 
                                value={correo} 
                                disabled 
                                className="input-bloqueado"
                            />
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

                        {/* Diccionarios de Ubicación */}
                        <div className="form-fila">
                            <div className="form-grupo">
                                <label>Ciudad *:</label>
                                <select 
                                    value={idCiudad} 
                                    onChange={handleCiudadChange}
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map(c => (
                                        <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo">
                                <label>Barrio *:</label>
                                <select 
                                    value={idBarrio} 
                                    onChange={(e) => setIdBarrio(e.target.value)}
                                    disabled={!editando || !idCiudad}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                >
                                    <option value="">Seleccione un barrio</option>
                                    {barriosDisponibles.map(b => (
                                        <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Dirección principal *:</label>
                            <input 
                                type="text" 
                                value={direccion} 
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Ej: Carrera 10 # 5-20"
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                                required 
                            />
                        </div>

                        <div className="form-grupo">
                            <label>Información complementaria (Opcional):</label>
                            <textarea 
                                value={infoComplementaria} 
                                onChange={(e) => setInfoComplementaria(e.target.value)}
                                placeholder="Ej: Torre 2 Apto 401, timbre blanco"
                                rows="3"
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                            />
                        </div>

                        {editando && (
                            <div className="form-acciones">
                                <button type="submit" className="btn-guardar">
                                    💾 Guardar Cambios
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}