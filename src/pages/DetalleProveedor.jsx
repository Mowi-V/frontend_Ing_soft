import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import { proveedoresService } from '../services/proveedores.service';
import { disponibilidadService } from '../services/disponibilidad.service';
import './DetalleProveedor.css';

const DIAS_SEMANA = [
    { id: 'LU', nombre: 'Lunes' },
    { id: 'MA', nombre: 'Martes' },
    { id: 'MI', nombre: 'Miércoles' },
    { id: 'JU', nombre: 'Jueves' },
    { id: 'VI', nombre: 'Viernes' },
    { id: 'SA', nombre: 'Sábado' },
    { id: 'DO', nombre: 'Domingo' }
];

export default function DetalleProveedor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [proveedor, setProveedor] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

    useEffect(() => {
        const cargarDatosProveedor = async () => {
            setCargando(true);
            setError(null);
            try {
                const data = await proveedoresService.obtenerDetalleProveedor(id);
                setProveedor(data.proveedor);
                setServicios(data.servicios || []);

                if (data.disponibilidad) {
                    setDisponibilidad(data.disponibilidad);
                    setPeriodos(data.periodos_no_disponibles || []);
                } else {
                    try {
                        const dataDisp = await disponibilidadService.obtenerDisponibilidadProveedor(id);
                        setDisponibilidad(dataDisp.disponibilidad || []);
                        setPeriodos(dataDisp.periodos_no_disponibles || []);
                    } catch {
                        setDisponibilidad([]);
                        setPeriodos([]);
                    }
                }
            } catch (err) {
                setError(err.message || 'Error al cargar el perfil del proveedor');
            } finally {
                setCargando(false);
            }
        };

        if (id) {
            cargarDatosProveedor();
        }
    }, [id]);

    const zonasAgrupadas = (proveedor?.zonas || []).reduce((acc, z) => {
        const comunaNombre = z.comuna || 'Comuna en Cali';
        if (!acc[comunaNombre]) acc[comunaNombre] = [];
        if (z.barrio) acc[comunaNombre].push(z.barrio);
        return acc;
    }, {});

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        return String(fechaStr).slice(0, 10);
    };

    if (cargando) {
        return (
            <div className="detalle-prov-wrapper">
                <Navbar />
                <div className="detalle-prov-loading">Cargando información del profesional...</div>
            </div>
        );
    }

    if (error || !proveedor) {
        return (
            <div className="detalle-prov-wrapper">
                <Navbar />
                <div className="detalle-prov-container">
                    <Alerta tipo="error" mensaje={error || 'Proveedor no encontrado'} />
                    <Link to="/dashboard-cliente" className="btn-volver-link">
                        ← Regresar a la exploración de servicios
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="detalle-prov-wrapper">
            <Navbar />

            <main className="detalle-prov-container">
                <Link to="/dashboard-cliente" className="btn-volver-link">
                    ← Volver a exploración de servicios
                </Link>

                {/* 1. FICHA PRINCIPAL DEL PROFESIONAL */}
                <section className="perfil-card-hero">
                    <div className="perfil-hero-info">
                        <div className="avatar-profesional-box">
                            {proveedor.nombre ? proveedor.nombre.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="perfil-hero-text">
                            <h1 className="prov-hero-title">{proveedor.nombre}</h1>
                            <p className="descripcion-profesional-txt">
                                {proveedor.descripcion_perfil || 'Profesional de bienestar, estética y masajes a domicilio en Santiago de Cali.'}
                            </p>
                        </div>
                    </div>

                    {/* CUADRÍCULA DE COBERTURA Y HORARIOS */}
                    <div className="prov-info-split-grid">
                        {/* COLUMNA A: ZONAS DE COBERTURA ORIENTATIVAS */}
                        <div className="cobertura-bloque">
                            <div className="bloque-header">
                                <h3 className="bloque-titulo">📍 Zonas de Atención (Santiago de Cali)</h3>
                                <p className="bloque-aviso">
                                    Información orientativa. El traslado exacto se confirma al momento de agendar el servicio.
                                </p>
                            </div>

                            {Object.keys(zonasAgrupadas).length === 0 ? (
                                <p className="sin-datos-txt">El profesional no ha especificado barrios preferenciales de cobertura.</p>
                            ) : (
                                <div className="comunas-lista-wrapper">
                                    {Object.entries(zonasAgrupadas).map(([comuna, barrios]) => (
                                        <div key={comuna} className="comuna-item-box">
                                            <span className="comuna-nombre-tag">{comuna}</span>
                                            <div className="barrios-chips-container">
                                                {barrios.map((b, idx) => (
                                                    <span key={idx} className="chip-barrio-tag">{b}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COLUMNA B: HORARIOS DE ATENCIÓN SEMANAL Y BLOQUEOS */}
                        <div className="horarios-bloque">
                            <div className="bloque-header">
                                <h3 className="bloque-titulo">🕒 Horarios de Atención Habitual</h3>
                                <p className="bloque-aviso">
                                    Jornada disponible para la recepción de solicitudes y servicios a domicilio.
                                </p>
                            </div>

                            <div className="semana-horarios-list">
                                {DIAS_SEMANA.map((dia) => {
                                    const franjasDia = disponibilidad.filter(f => f.dia === dia.id);
                                    return (
                                        <div key={dia.id} className="dia-horario-row">
                                            <span className="dia-label">{dia.nombre}</span>
                                            <div className="dia-franjas-chips">
                                                {franjasDia.length === 0 ? (
                                                    <span className="descanso-tag">Descanso</span>
                                                ) : (
                                                    franjasDia.map(f => (
                                                        <span key={f.id_disponibilidad} className="franja-horaria-chip">
                                                            {f.hora_inicio.slice(0, 5)} - {f.hora_fin.slice(0, 5)}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {periodos.length > 0 && (
                                <div className="periodos-bloqueo-box">
                                    <span className="bloqueo-title">📅 Próximos Periodos No Disponibles:</span>
                                    <div className="periodos-tags-list">
                                        {periodos.map(p => (
                                            <span key={p.id} className="periodo-badge">
                                                {formatearFecha(p.fecha_inicio)} al {formatearFecha(p.fecha_fin)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. CATÁLOGO DE SERVICIOS ACTIVOS */}
                <section className="catalogo-servicios-seccion">
                    <div className="catalogo-header">
                        <h2 className="catalogo-titulo">Servicios Publicados por este Profesional</h2>
                        <span className="total-servicios-badge">{servicios.length} servicios disponibles</span>
                    </div>

                    {servicios.length === 0 ? (
                        <p className="sin-servicios-txt">Este profesional no tiene servicios activos publicados en este momento.</p>
                    ) : (
                        <div className="servicios-prov-grid">
                            {servicios.map((s) => {
                                const miniatura = s.recursos?.find(r => r.es_miniatura === 1 && r.tipo === 'F')
                                               || s.recursos?.find(r => r.tipo === 'F');

                                return (
                                    <article key={s.id_servicio} className="servicio-prov-card">
                                        <div className="servicio-card-cover">
                                            {miniatura?.url_archivo ? (
                                                <img 
                                                    src={`${miniatura.url_archivo}?tr=w-400,h-200,fo-auto`} 
                                                    alt={s.nombre} 
                                                    className="servicio-img-cover" 
                                                />
                                            ) : (
                                                <div className="cover-empty-placeholder">
                                                    <span className="cover-oval"></span>
                                                    <span className="cover-txt">[Sin Imagen]</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="servicio-card-body">
                                            <span className="tag-categoria-pill">{s.categoria}</span>
                                            <h3 className="servicio-card-title">{s.nombre}</h3>
                                            <p className="desc-corta">{s.descripcion || 'Sin descripción detallada'}</p>

                                            <div className="servicio-meta-row">
                                                <span className="precio-val">${Number(s.precio).toLocaleString()} COP</span>
                                                <span className="duracion-val">⏱ {s.duracion_minutos} min</span>
                                            </div>

                                            <div className="servicio-acciones-row">
                                                <button 
                                                    type="button" 
                                                    className="btn-ver-detalle"
                                                    onClick={() => setServicioSeleccionado(s)}
                                                >
                                                    Vista Rápida
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-solicitar-servicio"
                                                    onClick={() => navigate(`/servicio/${s.id_servicio}`)}
                                                >
                                                    Agendar Cita
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 3. MODAL DE VISTA RÁPIDA DE SERVICIO */}
                {servicioSeleccionado && (
                    <div className="modal-overlay" onClick={() => setServicioSeleccionado(null)}>
                        <div className="modal-detalle-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{servicioSeleccionado.nombre}</h3>
                                <button type="button" className="btn-cerrar-modal" onClick={() => setServicioSeleccionado(null)}>✕</button>
                            </div>

                            <div className="modal-body-scroll">
                                <div className="modal-tags-meta">
                                    <span className="tag-categoria-pill">{servicioSeleccionado.categoria}</span>
                                    <span className="modal-meta-item">⏱ {servicioSeleccionado.duracion_minutos} minutos de sesión</span>
                                    <span className="precio-modal">${Number(servicioSeleccionado.precio).toLocaleString()} COP</span>
                                </div>

                                <div className="modal-campo-bloque">
                                    <h5>Descripción del Servicio</h5>
                                    <p>{servicioSeleccionado.descripcion}</p>
                                </div>

                                {servicioSeleccionado.recursos?.length > 0 && (
                                    <div className="modal-campo-bloque">
                                        <h5>Fotografías de Referencia</h5>
                                        <div className="modal-galeria-grid">
                                            {servicioSeleccionado.recursos.map((r) => (
                                                <div key={r.id_recurso} className="galeria-thumb">
                                                    {r.tipo === 'F' ? (
                                                        <img src={`${r.url_archivo}?tr=w-160,h-110,fo-auto`} alt="Foto de referencia" />
                                                    ) : (
                                                        <div className="video-thumb-txt">🎬 Video</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn-cerrar-outline"
                                    onClick={() => setServicioSeleccionado(null)}
                                >
                                    Cerrar
                                </button>
                                <button 
                                    type="button"
                                    className="btn-solicitar-modal"
                                    onClick={() => navigate(`/servicio/${servicioSeleccionado.id_servicio}`)}
                                >
                                    Ir a Agendar este Servicio →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}