import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { clientesService } from '../services/clientes.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import './PerfilCliente.css';

export default function PerfilCliente() {
    const [editando, setEditando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [ciudades, setCiudades] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);

    const [correo, setCorreo] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [idCiudad, setIdCiudad] = useState('');
    const [idBarrio, setIdBarrio] = useState('');
    const [direccion, setDireccion] = useState('');
    const [infoComplementaria, setInfoComplementaria] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setError(null);
            try {
                const [dataPerfil, dataUbicaciones] = await Promise.all([
                    clientesService.obtenerPerfil(),
                    ubicacionesService.obtenerUbicaciones()
                ]);

                setCiudades(dataUbicaciones || []);

                const p = dataPerfil.perfil || dataPerfil;
                setCorreo(p.correo_electronico || '');
                setNombre(p.nombre || '');
                setApellido(p.apellido || '');
                setIdCiudad(p.id_ciudad ? String(p.id_ciudad) : '');
                setIdBarrio(p.id_barrio ? String(p.id_barrio) : '');
                setDireccion(p.direccion || '');
                setInfoComplementaria(p.informacion_complementaria || '');

                if (p.id_ciudad && dataUbicaciones) {
                    const ciudadEncontrada = dataUbicaciones.find(
                        c => String(c.id_ciudad) === String(p.id_ciudad)
                    );
                    if (ciudadEncontrada) {
                        setBarriosDisponibles(ciudadEncontrada.Barrios || []);
                    }
                }
            } catch (err) {
                setError(err.message || 'Error al cargar la información del perfil.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const handleCiudadChange = (e) => {
        const nuevaCiudadId = e.target.value;
        setIdCiudad(nuevaCiudadId);
        setIdBarrio('');

        const ciudadEncontrada = ciudades.find(c => String(c.id_ciudad) === String(nuevaCiudadId));
        setBarriosDisponibles(ciudadEncontrada ? ciudadEncontrada.Barrios || [] : []);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);
        setMensaje(null);

        try {
            await clientesService.actualizarPerfil({
                nombre,
                apellido,
                id_ciudad: parseInt(idCiudad, 10),
                id_barrio: parseInt(idBarrio, 10),
                direccion,
                informacion_complementaria: infoComplementaria
            });

            setMensaje('Perfil actualizado correctamente.');
            setEditando(false);
        } catch (err) {
            setError(err.message || 'Error al guardar los cambios.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="perfil-cliente-wrapper">
                <Navbar />
                <div className="perfil-cargando">Cargando datos de la cuenta...</div>
            </div>
        );
    }

    return (
        <div className="perfil-cliente-wrapper">
            <Navbar />

            <main className="perfil-container">
                {/* Tarjeta 1: Cabecera con Avatar */}
                <div className="perfil-header-card">
                    <div className="perfil-avatar-circle"></div>
                    <div className="perfil-header-text">
                        <h1 className="perfil-header-title">Mi Cuenta</h1>
                        <p className="perfil-header-subtitle">
                            Consulta y administra tus datos personales y dirección de atención
                        </p>
                    </div>
                </div>

                {/* Tarjeta 2: Formulario de Datos */}
                <div className="perfil-form-card">
                    <div className="perfil-top-actions">
                        <span className={`perfil-badge-estado ${editando ? 'modo-edicion' : 'modo-lectura'}`}>
                            {editando ? 'Modo Edición Activado' : 'Campos Bloqueados (Solo Lectura)'}
                        </span>

                        {!editando ? (
                            <button
                                type="button"
                                className="btn-actualizar-campos"
                                onClick={() => { setEditando(true); setMensaje(null); setError(null); }}
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

                    {mensaje && <div className="perfil-alerta-exito">{mensaje}</div>}
                    {error && <div className="perfil-alerta-error">{error}</div>}

                    <form onSubmit={handleGuardar} className="perfil-form">
                        <div className="perfil-form-group">
                            <label htmlFor="correo">Correo Electrónico (No modificable):</label>
                            <input
                                id="correo"
                                type="email"
                                value={correo}
                                disabled
                                className="input-bloqueado"
                            />
                        </div>

                        <div className="perfil-form-row">
                            <div className="perfil-form-group">
                                <label htmlFor="nombre">Nombre *:</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                />
                            </div>
                            <div className="perfil-form-group">
                                <label htmlFor="apellido">Apellido *:</label>
                                <input
                                    id="apellido"
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                />
                            </div>
                        </div>

                        <div className="perfil-form-row">
                            <div className="perfil-form-group">
                                <label htmlFor="ciudad">Ciudad *:</label>
                                <select
                                    id="ciudad"
                                    value={idCiudad}
                                    onChange={handleCiudadChange}
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map(c => (
                                        <option key={c.id_ciudad} value={c.id_ciudad}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="perfil-form-group">
                                <label htmlFor="barrio">Barrio *:</label>
                                <select
                                    id="barrio"
                                    value={idBarrio}
                                    onChange={(e) => setIdBarrio(e.target.value)}
                                    disabled={!editando || !idCiudad}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                >
                                    <option value="">Seleccione un barrio</option>
                                    {barriosDisponibles.map(b => (
                                        <option key={b.id_barrio} value={b.id_barrio}>
                                            {b.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="perfil-form-group">
                            <label htmlFor="direccion">Dirección principal *:</label>
                            <input
                                id="direccion"
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Ej: Carrera 10 # 5-20"
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                                required
                            />
                        </div>

                        <div className="perfil-form-group">
                            <label htmlFor="infoComplementaria">Información complementaria (Opcional):</label>
                            <textarea
                                id="infoComplementaria"
                                rows="3"
                                value={infoComplementaria}
                                onChange={(e) => setInfoComplementaria(e.target.value)}
                                placeholder="Ej: Torre 2 Apto 401, timbre blanco"
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                            />
                        </div>

                        {editando && (
                            <div className="perfil-acciones-guardar">
                                <button type="submit" className="btn-guardar-perfil" disabled={guardando}>
                                    {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}