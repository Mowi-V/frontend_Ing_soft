import { useEffect, useState } from 'react';
import NavbarProveedor from '../components/NavbarProveedor';
import { proveedoresService } from '../services/proveedores.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import './PerfilProveedor.css';

export default function PerfilProveedor() {
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [agregandoZona, setAgregandoZona] = useState(false);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const [comunas, setComunas] = useState([]);
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);

    const [perfil, setPerfil] = useState({
        correo_electronico: '',
        nombre: '',
        apellido: '',
        descripcion_perfil: '',
        zonas: []
    });

    const [zonaForm, setZonaForm] = useState({
        id_comuna: '',
        id_barrio: ''
    });

    const cargarDatos = async () => {
        try {
            const [dataPerfil, dataUbicaciones] = await Promise.all([
                proveedoresService.obtenerMiPerfil(),
                ubicacionesService.obtenerUbicaciones()
            ]);

            setComunas(dataUbicaciones || []);

            const p = dataPerfil?.perfil || dataPerfil?.proveedor || dataPerfil || {};
            const zonasRecibidas = p.zonas || p.zonas_atencion || p.ZonaAtencions || [];

            setPerfil({
                correo_electronico: p.correo_electronico || '',
                nombre: p.nombre || '',
                apellido: p.apellido || '',
                descripcion_perfil: p.descripcion_perfil || '',
                zonas: Array.isArray(zonasRecibidas) ? zonasRecibidas : []
            });
        } catch (err) {
            console.error('Error al cargar datos del proveedor:', err);
            setError(err.message || 'Error al cargar la información del proveedor.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleComunaZonaChange = (e) => {
        const idComuna = e.target.value;
        setZonaForm({ id_comuna: idComuna, id_barrio: '' });
        const com = comunas.find(c => String(c.id_comuna) === String(idComuna));
        setBarriosDisponibles(com ? com.Barrios || [] : []);
    };

    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);
        setMensaje(null);

        try {
            await proveedoresService.actualizarMiPerfil({
                nombre: perfil.nombre,
                apellido: perfil.apellido,
                descripcion_perfil: perfil.descripcion_perfil
            });
            localStorage.setItem('usuario_nombre', perfil.nombre);
            setMensaje('Perfil profesional actualizado correctamente.');
            setEditando(false);
        } catch (err) {
            setError(err.message || 'Error al guardar los cambios del perfil.');
        } finally {
            setGuardando(false);
        }
    };

    const handleAgregarZona = async (e) => {
        e.preventDefault();
        if (!zonaForm.id_comuna || !zonaForm.id_barrio) return;

        setAgregandoZona(true);
        setError(null);
        setMensaje(null);
        try {
            await proveedoresService.agregarZona(
                parseInt(zonaForm.id_comuna, 10),
                parseInt(zonaForm.id_barrio, 10)
            );
            setZonaForm({ ...zonaForm, id_barrio: '' });
            setMensaje('Barrio añadido a tus zonas de atención.');
            await cargarDatos();
        } catch (err) {
            setError(err.message || 'Error al registrar la zona de atención.');
        } finally {
            setAgregandoZona(false);
        }
    };

    const handleEliminarZona = async (idZona) => {
        setError(null);
        try {
            await proveedoresService.eliminarZona(idZona);
            await cargarDatos();
        } catch (err) {
            setError(err.message || 'Error al retirar la zona de atención.');
        }
    };

    // Agrupar zonas por el nombre de la Comuna
    const zonasAgrupadasPorComuna = perfil.zonas.reduce((acc, z) => {
        const nombreComuna = z.Comuna?.nombre || z.comuna || 'Comuna en Cali';
        if (!acc[nombreComuna]) acc[nombreComuna] = [];
        acc[nombreComuna].push(z);
        return acc;
    }, {});

    if (cargando) {
        return (
            <div className="perfil-prov-wrapper">
                <NavbarProveedor />
                <div className="perfil-prov-cargando">Cargando datos de la cuenta...</div>
            </div>
        );
    }

    return (
        <div className="perfil-prov-wrapper">
            <NavbarProveedor />

            <main className="perfil-prov-container">
                {/* Tarjeta 1: Cabecera con Avatar */}
                <div className="perfil-header-card">
                    <div className="perfil-avatar-circle"></div>
                    <div className="perfil-header-text">
                        <h1 className="perfil-header-title">Mi Cuenta (Proveedor)</h1>
                        <p className="perfil-header-subtitle">
                            Consulta y administra tus credenciales profesionales y comunas/barrios de cobertura en Cali
                        </p>
                    </div>
                </div>

                {mensaje && <div className="perfil-prov-alerta-exito">{mensaje}</div>}
                {error && <div className="perfil-prov-alerta-error">{error}</div>}

                {/* Tarjeta 2: Formulario de Datos Profesionales */}
                <div className="perfil-card-bloque">
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

                    <form onSubmit={handleGuardarPerfil} className="perfil-prov-form">
                        <div className="perfil-form-group">
                            <label htmlFor="correo">Correo Electrónico (No modificable):</label>
                            <input
                                id="correo"
                                type="email"
                                value={perfil.correo_electronico}
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
                                    value={perfil.nombre}
                                    onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
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
                                    value={perfil.apellido}
                                    onChange={(e) => setPerfil({ ...perfil, apellido: e.target.value })}
                                    disabled={!editando}
                                    className={!editando ? 'input-bloqueado' : ''}
                                    required
                                />
                            </div>
                        </div>

                        <div className="perfil-form-group">
                            <label htmlFor="descripcion">Descripción del Perfil Profesional *:</label>
                            <textarea
                                id="descripcion"
                                rows="3"
                                placeholder="Indica tu especialidad, experiencia y enfoque de atención..."
                                value={perfil.descripcion_perfil}
                                onChange={(e) => setPerfil({ ...perfil, descripcion_perfil: e.target.value })}
                                disabled={!editando}
                                className={!editando ? 'input-bloqueado' : ''}
                                required
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

                {/* Tarjeta 3: Zonas Generales de Atención en Cali */}
                <div className="perfil-card-bloque">
                    <div className="zonas-header-box">
                        <h2 className="zonas-titulo-principal">Zonas Generales de Atención (Santiago de Cali)</h2>
                        <p className="zonas-subtexto">
                            Informa las comunas y barrios donde ofreces tus servicios. Esta información es orientativa para tus clientes.
                        </p>
                    </div>

                    {/* Sub-caja de Selección para Añadir Barrio */}
                    <form onSubmit={handleAgregarZona} className="zona-agregar-card">
                        <div className="zona-inputs-grid">
                            <div className="zona-input-field">
                                <label htmlFor="selectComuna">Comuna:</label>
                                <select
                                    id="selectComuna"
                                    value={zonaForm.id_comuna}
                                    onChange={handleComunaZonaChange}
                                    required
                                >
                                    <option value="">Selecciona una comuna</option>
                                    {comunas.map(c => (
                                        <option key={c.id_comuna} value={c.id_comuna}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="zona-input-field">
                                <label htmlFor="selectBarrio">Barrio / Sector:</label>
                                <select
                                    id="selectBarrio"
                                    value={zonaForm.id_barrio}
                                    onChange={(e) => setZonaForm({ ...zonaForm, id_barrio: e.target.value })}
                                    disabled={!zonaForm.id_comuna}
                                    required
                                >
                                    <option value="">Selecciona un barrio</option>
                                    {barriosDisponibles.map(b => (
                                        <option key={b.id_barrio} value={b.id_barrio}>
                                            {b.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn-anadir-barrio"
                                disabled={agregandoZona || !zonaForm.id_barrio}
                            >
                                {agregandoZona ? '+ Guardando...' : '+ Añadir Barrio'}
                            </button>
                        </div>
                    </form>

                    {/* Sub-caja con las Zonas Agrupadas por Comuna */}
                    <div className="zonas-registradas-card">
                        {Object.keys(zonasAgrupadasPorComuna).length === 0 ? (
                            <p className="zonas-vacias-txt">No tienes comunas ni barrios de cobertura registrados aún.</p>
                        ) : (
                            Object.entries(zonasAgrupadasPorComuna).map(([comuna, zonasDeComuna]) => (
                                <div key={comuna} className="ciudad-grupo-contenedor">
                                    <h3 className="ciudad-grupo-titulo">
                                        📍 {comuna}
                                    </h3>
                                    <div className="barrios-chips-wrapper">
                                        {zonasDeComuna.map(z => (
                                            <span key={z.id_zona} className="barrio-chip">
                                                {z.Barrio?.nombre || z.barrio}
                                                <button
                                                    type="button"
                                                    className="btn-remove-chip"
                                                    onClick={() => handleEliminarZona(z.id_zona)}
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