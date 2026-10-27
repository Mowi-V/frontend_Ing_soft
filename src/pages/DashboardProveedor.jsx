import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
import Alerta from '../components/common/Alerta';
import { serviciosService } from '../services/servicios.service';
import './DashboardProveedor.css';

export default function DashboardProveedor() {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [formEdit, setFormEdit] = useState({
        nombre: '',
        categoria: 'Estética',
        duracion_minutos: '',
        precio: '',
        estado: 'A',
        descripcion: ''
    });

    // Estados para insumos
    const [nuevoInsumoNombre, setNuevoInsumoNombre] = useState('');
    const [guardandoInsumo, setGuardandoInsumo] = useState(false);

    // Estados para multimedia
    const [archivoSubir, setArchivoSubir] = useState(null);
    const [esMiniatura, setEsMiniatura] = useState(false);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [conmutandoEstado, setConmutandoEstado] = useState(false);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const cargarServicios = async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await serviciosService.obtenerMisServicios();
            setServicios(data.servicios || []);
        } catch (err) {
            setError(err.message || 'Error al cargar los servicios');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, []);

    const seleccionarParaEditar = (s) => {
        setServicioSeleccionado(s);
        setFormEdit({
            nombre: s.nombre,
            categoria: s.categoria,
            duracion_minutos: s.duracion_minutos,
            precio: s.precio,
            estado: s.estado,
            descripcion: s.descripcion || ''
        });
        setNuevoInsumoNombre('');
        setArchivoSubir(null);
        setEsMiniatura(false);
        setMensaje(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        if (!servicioSeleccionado) return;

        setGuardando(true);
        setError(null);
        setMensaje(null);

        try {
            const payload = {
                ...formEdit,
                duracion_minutos: parseInt(formEdit.duracion_minutos, 10),
                precio: parseFloat(formEdit.precio)
            };

            const respuesta = await serviciosService.actualizarServicio(servicioSeleccionado.id_servicio, payload);
            setMensaje('Servicio actualizado con éxito.');

            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio 
                    ? { ...respuesta.servicio, insumos: s.insumos, recursos: s.recursos } 
                    : s))
            );
            setServicioSeleccionado(prev => ({ ...respuesta.servicio, insumos: prev.insumos, recursos: prev.recursos }));
        } catch (err) {
            setError(err.message || 'Error al actualizar el servicio.');
        } finally {
            setGuardando(false);
        }
    };

    const handleAlternarEstado = async (e, servicio) => {
        e.stopPropagation();
        const nuevoEstado = servicio.estado === 'A' ? 'I' : 'A';
        setConmutandoEstado(true);
        setError(null);
        setMensaje(null);

        try {
            const respuesta = await serviciosService.cambiarEstadoServicio(servicio.id_servicio, nuevoEstado);
            setMensaje(`Servicio marcado como ${nuevoEstado === 'A' ? 'Activo' : 'Inactivo'}.`);

            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicio.id_servicio 
                    ? { ...respuesta.servicio, insumos: s.insumos, recursos: s.recursos } 
                    : s))
            );

            if (servicioSeleccionado?.id_servicio === servicio.id_servicio) {
                setServicioSeleccionado(prev => ({ ...respuesta.servicio, insumos: prev.insumos, recursos: prev.recursos }));
                setFormEdit(prev => ({ ...prev, estado: nuevoEstado }));
            }
        } catch (err) {
            setError(err.message || 'Error al modificar el estado del servicio.');
        } finally {
            setConmutandoEstado(false);
        }
    };

    // HU-008: Agregar Insumo
    const handleAgregarInsumo = async (e) => {
        e.preventDefault();
        if (!nuevoInsumoNombre.trim() || !servicioSeleccionado) return;

        setGuardandoInsumo(true);
        setError(null);
        try {
            const res = await serviciosService.agregarInsumo(servicioSeleccionado.id_servicio, nuevoInsumoNombre.trim());
            const nuevo = res.insumo;

            setServicioSeleccionado(prev => ({
                ...prev,
                insumos: [...(prev.insumos || []), nuevo]
            }));

            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio
                    ? { ...s, insumos: [...(s.insumos || []), nuevo] }
                    : s))
            );

            setNuevoInsumoNombre('');
            setMensaje('Insumo registrado correctamente.');
        } catch (err) {
            setError(err.message || 'Error al agregar el insumo.');
        } finally {
            setGuardandoInsumo(false);
        }
    };

    // HU-008: Eliminar Insumo
    const handleEliminarInsumo = async (idInsumo) => {
        if (!servicioSeleccionado) return;
        setError(null);
        try {
            await serviciosService.eliminarInsumo(servicioSeleccionado.id_servicio, idInsumo);

            setServicioSeleccionado(prev => ({
                ...prev,
                insumos: (prev.insumos || []).filter(i => i.id_insumo !== idInsumo)
            }));

            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio
                    ? { ...s, insumos: (s.insumos || []).filter(i => i.id_insumo !== idInsumo) }
                    : s))
            );
            setMensaje('Insumo eliminado.');
        } catch (err) {
            setError(err.message || 'Error al eliminar el insumo.');
        }
    };

    // HU-008: Subir Recurso Multimedia
    const handleSubirMultimedia = async (e) => {
        e.preventDefault();
        if (!archivoSubir || !servicioSeleccionado) return;

        setSubiendoArchivo(true);
        setError(null);

        const formData = new FormData();
        formData.append('recurso', archivoSubir);
        formData.append('es_miniatura', esMiniatura);

        try {
            const res = await serviciosService.subirRecursoMultimedia(servicioSeleccionado.id_servicio, formData);
            const nuevoRecurso = res.recurso;

            // Si es miniatura, actualizar los demás en memoria
            const recursosActualizados = (servicioSeleccionado.recursos || [])
                .map(r => (nuevoRecurso.es_miniatura === 1 ? { ...r, es_miniatura: 0 } : r))
                .concat(nuevoRecurso);

            setServicioSeleccionado(prev => ({ ...prev, recursos: recursosActualizados }));
            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio
                    ? { ...s, recursos: recursosActualizados }
                    : s))
            );

            setArchivoSubir(null);
            setEsMiniatura(false);
            setMensaje('Archivo multimedia subido con éxito.');
        } catch (err) {
            setError(err.message || 'Error al subir el archivo multimedia.');
        } finally {
            setSubiendoArchivo(false);
        }
    };

    // HU-008: Eliminar Recurso Multimedia
    const handleEliminarRecurso = async (idRecurso) => {
        if (!servicioSeleccionado) return;
        setError(null);
        try {
            await serviciosService.eliminarRecursoMultimedia(servicioSeleccionado.id_servicio, idRecurso);

            const filtrados = (servicioSeleccionado.recursos || []).filter(r => r.id_recurso !== idRecurso);
            setServicioSeleccionado(prev => ({ ...prev, recursos: filtrados }));
            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio
                    ? { ...s, recursos: filtrados }
                    : s))
            );
            setMensaje('Recurso multimedia eliminado.');
        } catch (err) {
            setError(err.message || 'Error al eliminar el archivo multimedia.');
        }
    };

    return (
        <div className="prov-dashboard-wrapper">
            <NavbarProveedor />

            <main className="prov-container">
                <div className="prov-header-actions">
                    <div className="prov-header-text">
                        <h1 className="prov-title">Mis Servicios Registrados</h1>
                        <p className="prov-subtitle">
                            Gestiona tu catálogo, actualiza tarifas, insumos y recursos multimedia.
                        </p>
                    </div>
                    <button 
                        type="button"
                        className="btn-crear-servicio"
                        onClick={() => navigate('/crear-servicio')}
                    >
                        + Crear un Servicio
                    </button>
                </div>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {cargando ? (
                    <p className="prov-loading-text">Cargando catálogo de servicios...</p>
                ) : (
                    <div className="prov-layout-body">
                        <section className="prov-cards-grid">
                            {servicios.length === 0 ? (
                                <p className="prov-empty-text">
                                    No tienes servicios registrados aún. Haz clic en "+ Crear un Servicio" para comenzar.
                                </p>
                            ) : (
                                servicios.map((s) => {
                                    const miniatura = (s.recursos || []).find(r => r.es_miniatura === 1) || (s.recursos || [])[0];
                                    return (
                                        <article 
                                            key={s.id_servicio} 
                                            className={`prov-service-card ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'card-seleccionada' : ''}`}
                                            onClick={() => seleccionarParaEditar(s)}
                                        >
                                            {miniatura && (
                                                <div className="prov-card-thumb-container">
                                                    <img 
                                                        src={`${miniatura.url_archivo}?tr=w-300,h-160,fo-auto`} 
                                                        alt={s.nombre} 
                                                        className="prov-card-thumb" 
                                                    />
                                                </div>
                                            )}

                                            <div className="prov-card-header">
                                                <span className="prov-badge-cat">
                                                    {s.categoria ? s.categoria.toUpperCase() : 'GENERAL'}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={`prov-badge-estado ${s.estado === 'A' ? 'estado-activo' : 'estado-inactivo'}`}
                                                    onClick={(e) => handleAlternarEstado(e, s)}
                                                    disabled={conmutandoEstado}
                                                    title="Haz clic para alternar estado"
                                                >
                                                    {s.estado === 'A' ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </div>

                                            <h3 className="prov-card-name">{s.nombre}</h3>
                                            <p className="prov-card-desc">{s.descripcion || 'Sin descripción'}</p>

                                            <div className="prov-card-tags">
                                                {(s.insumos || []).length > 0 && (
                                                    <span className="prov-tag-count">
                                                        🎒 {(s.insumos || []).length} insumos
                                                    </span>
                                                )}
                                                {(s.recursos || []).length > 0 && (
                                                    <span className="prov-tag-count">
                                                        📷 {(s.recursos || []).length} fotos/videos
                                                    </span>
                                                )}
                                            </div>

                                            <div className="prov-card-footer">
                                                <div className="prov-card-duration">
                                                    <span className="prov-clock-icon">⏱</span> {s.duracion_minutos} min
                                                </div>
                                                <div className="prov-card-price-group">
                                                    <span className="prov-card-price">
                                                        ${Number(s.precio).toLocaleString()}
                                                    </span>
                                                    <span className="prov-card-edit-hint">Editar</span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </section>

                        {servicioSeleccionado && (
                            <aside className="prov-edit-drawer">
                                <div className="drawer-header">
                                    <h3>Editar: {servicioSeleccionado.nombre}</h3>
                                    <button 
                                        type="button" 
                                        className="btn-close-drawer"
                                        onClick={() => setServicioSeleccionado(null)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleGuardarCambios} className="drawer-form">
                                    <div className="drawer-field">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input 
                                            id="nombre"
                                            type="text" 
                                            name="nombre" 
                                            value={formEdit.nombre} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="drawer-field">
                                        <label htmlFor="categoria">Categoría</label>
                                        <select 
                                            id="categoria"
                                            name="categoria" 
                                            value={formEdit.categoria} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="Estética">Estética</option>
                                            <option value="Bienestar">Bienestar</option>
                                            <option value="Masajes">Masajes</option>
                                        </select>
                                    </div>

                                    <div className="drawer-row">
                                        <div className="drawer-field">
                                            <label htmlFor="duracion_minutos">Duración (min)</label>
                                            <input 
                                                id="duracion_minutos"
                                                type="number" 
                                                name="duracion_minutos" 
                                                value={formEdit.duracion_minutos} 
                                                onChange={handleInputChange} 
                                                min="1"
                                                required 
                                            />
                                        </div>
                                        <div className="drawer-field">
                                            <label htmlFor="estado">Estado</label>
                                            <select 
                                                id="estado"
                                                name="estado" 
                                                value={formEdit.estado} 
                                                onChange={handleInputChange}
                                            >
                                                <option value="A">Activo (Visible)</option>
                                                <option value="I">Inactivo (Oculto)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="drawer-field">
                                        <label htmlFor="precio">Precio ($ COP)</label>
                                        <input 
                                            id="precio"
                                            type="number" 
                                            name="precio" 
                                            value={formEdit.precio} 
                                            onChange={handleInputChange} 
                                            min="0"
                                            step="1000"
                                            required 
                                        />
                                    </div>

                                    <div className="drawer-field">
                                        <label htmlFor="descripcion">Descripción</label>
                                        <textarea 
                                            id="descripcion"
                                            name="descripcion" 
                                            rows="2" 
                                            value={formEdit.descripcion} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn-drawer-save"
                                        disabled={guardando}
                                    >
                                        {guardando ? 'Guardando...' : 'Guardar Datos Comerciales'}
                                    </button>
                                </form>

                                <hr className="drawer-divider" />

                                {/* SECCIÓN HU-008: Insumos y Equipos */}
                                <div className="drawer-section">
                                    <h4>Insumos y Equipos Requeridos</h4>
                                    <form onSubmit={handleAgregarInsumo} className="form-inline-add">
                                        <input 
                                            type="text" 
                                            placeholder="Ej. Aceite de almendras, toallas"
                                            value={nuevoInsumoNombre}
                                            onChange={(e) => setNuevoInsumoNombre(e.target.value)}
                                            required
                                        />
                                        <button type="submit" disabled={guardandoInsumo}>
                                            + Agregar
                                        </button>
                                    </form>

                                    <div className="drawer-chips-list">
                                        {(servicioSeleccionado.insumos || []).length === 0 ? (
                                            <p className="drawer-subtext">No hay insumos registrados para este servicio.</p>
                                        ) : (
                                            (servicioSeleccionado.insumos || []).map((ins) => (
                                                <span key={ins.id_insumo} className="drawer-chip">
                                                    {ins.nombre}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleEliminarInsumo(ins.id_insumo)}
                                                        title="Eliminar insumo"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <hr className="drawer-divider" />

                                {/* SECCIÓN HU-008: Multimedia e Imágenes */}
                                <div className="drawer-section">
                                    <h4>Fotografías y Videos de Referencia</h4>
                                    <form onSubmit={handleSubirMultimedia} className="form-upload-media">
                                        <input 
                                            type="file" 
                                            accept="image/*,video/*"
                                            onChange={(e) => setArchivoSubir(e.target.files[0] || null)}
                                            required
                                        />
                                        <label className="checkbox-miniatura">
                                            <input 
                                                type="checkbox" 
                                                checked={esMiniatura} 
                                                onChange={(e) => setEsMiniatura(e.target.checked)} 
                                            />
                                            Establecer como imagen de portada (miniatura)
                                        </label>
                                        <button 
                                            type="submit" 
                                            className="btn-upload-file"
                                            disabled={subiendoArchivo || !archivoSubir}
                                        >
                                            {subiendoArchivo ? 'Subiendo a la nube...' : 'Subir Archivo'}
                                        </button>
                                    </form>

                                    <div className="drawer-media-grid">
                                        {(servicioSeleccionado.recursos || []).length === 0 ? (
                                            <p className="drawer-subtext">No hay fotos ni videos asociados.</p>
                                        ) : (
                                            (servicioSeleccionado.recursos || []).map((rec) => (
                                                <div 
                                                    key={rec.id_recurso} 
                                                    className={`drawer-media-item ${rec.es_miniatura === 1 ? 'es-miniatura' : ''}`}
                                                >
                                                    {rec.tipo === 'F' ? (
                                                        <img 
                                                            src={`${rec.url_archivo}?tr=w-120,h-80,fo-auto`} 
                                                            alt="Referencia" 
                                                        />
                                                    ) : (
                                                        <div className="video-placeholder">🎬 Video</div>
                                                    )}
                                                    {rec.es_miniatura === 1 && (
                                                        <span className="badge-portada">Portada</span>
                                                    )}
                                                    <button 
                                                        type="button"
                                                        className="btn-del-media"
                                                        onClick={() => handleEliminarRecurso(rec.id_recurso)}
                                                        title="Eliminar archivo"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}