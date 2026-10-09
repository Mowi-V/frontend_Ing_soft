import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './DetalleProveedor.css';

export default function DetalleProveedor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [proveedor, setProveedor] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal para HU-010 Criterio 4: Detalle completo del servicio
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        if (!token || rol !== 'C') {
            navigate('/login');
            return;
        }

        const cargarDatosProveedor = async () => {
            setCargando(true);
            setError(null);
            try {
                const res = await fetch(`/api/proveedores/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setProveedor(data.proveedor);
                    setServicios(data.servicios || []);
                } else {
                    setError(data.msg || 'Proveedor no encontrado');
                }
            } catch (err) {
                console.error(err);
                setError('Error de conexión al cargar el perfil del proveedor');
            } finally {
                setCargando(false);
            }
        };

        cargarDatosProveedor();
    }, [id, navigate]);

    // Agrupación de zonas por ciudad para presentación clara
    const zonasAgrupadas = proveedor?.zonas?.reduce((acc, z) => {
        const c = z.ciudad || 'Ciudad';
        if (!acc[c]) acc[c] = [];
        acc[c].push(z.barrio);
        return acc;
    }, {}) || {};

    if (cargando) {
        return (
            <div className="detalle-prov-wrapper">
                <Navbar />
                <div className="detalle-prov-loading">Cargando información del profesional...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detalle-prov-wrapper">
                <Navbar />
                <div className="detalle-prov-error-container">
                    <h3>Atención</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard-cliente')} className="btn-volver">
                        ← Regresar a la exploración
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="detalle-prov-wrapper">
            <Navbar />

            <main className="detalle-prov-container">
                {/* CABECERA: PERFIL DEL PROFESIONAL */}
                <section className="perfil-card-hero">
                    <div className="perfil-hero-info">
                        <div className="avatar-profesional-box"></div>
                        <div>
                            <h2>{proveedor.nombre}</h2>
                            <p className="descripcion-profesional-txt">
                                {proveedor.descripcion_perfil || 'Sin descripción profesional registrada.'}
                            </p>
                        </div>
                    </div>

                    {/* ZONAS DE ATENCIÓN (HU-010 Criterio 2 y 3) */}
                    <div className="cobertura-seccion-hero">
                        <h4>Zonas Generales de Cobertura</h4>
                        <p className="aviso-orientativo">
                            ℹ️ Información orientativa. La viabilidad del desplazamiento es acordada directamente con el profesional.
                        </p>

                        {Object.keys(zonasAgrupadas).length === 0 ? (
                            <p className="sin-zonas-txt">El proveedor no tiene zonas de cobertura registradas por el momento.</p>
                        ) : (
                            <div className="grupos-ciudades-wrapper">
                                {Object.entries(zonasAgrupadas).map(([ciudad, barrios]) => (
                                    <div key={ciudad} className="ciudad-chip-box">
                                        <strong>📍 {ciudad}:</strong>
                                        <div className="barrios-chips">
                                            {barrios.map((b, idx) => (
                                                <span key={idx} className="chip-barrio">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CATÁLOGO DE SERVICIOS ACTIVOS DEL PROVEEDOR */}
                <section className="catalogo-servicios-seccion">
                    <div className="catalogo-header">
                        <h3>Catálogo de Servicios</h3>
                        <span className="total-servicios-badge">{servicios.length} servicios disponibles</span>
                    </div>

                    {servicios.length === 0 ? (
                        <p className="sin-servicios-txt">Este proveedor no tiene servicios activos publicados actualmente.</p>
                    ) : (
                        <div className="servicios-prov-grid">
                            {servicios.map((s) => {
                                const miniatura = s.recursos?.find(r => r.es_miniatura === 1 && r.tipo === 'F')
                                               || s.recursos?.find(r => r.tipo === 'F');

                                return (
                                    <article key={s.id_servicio} className="servicio-prov-card">
                                        <div className="servicio-card-cover">
                                            {miniatura?.url_archivo ? (
                                                <img src={miniatura.url_archivo} alt={s.nombre} />
                                            ) : (
                                                <div className="cover-empty">[Sin Imagen]</div>
                                            )}
                                        </div>
                                        <div className="servicio-card-body">
                                            <span className="tag-categoria-pill">{s.categoria}</span>
                                            <h4>{s.nombre}</h4>
                                            <p className="desc-corta">{s.descripcion}</p>

                                            <div className="servicio-meta-row">
                                                <span className="precio-val">${Number(s.precio).toLocaleString()}</span>
                                                <span className="duracion-val">⏱ {s.duracion_minutos} min</span>
                                            </div>

                                            <div className="servicio-acciones-row">
                                                <button 
                                                    type="button" 
                                                    className="btn-ver-detalle"
                                                    onClick={() => setServicioSeleccionado(s)}
                                                >
                                                    Ver Detalle
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-solicitar-servicio"
                                                    onClick={() => alert(`para el otro sprint`)}
                                                >
                                                    Solicitar
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* MODAL HU-010: DETALLE COMPLETO DEL SERVICIO Y RECURSOS */}
                {servicioSeleccionado && (
                    <div className="modal-overlay" onClick={() => setServicioSeleccionado(null)}>
                        <div className="modal-detalle-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{servicioSeleccionado.nombre}</h3>
                                <button className="btn-cerrar-modal" onClick={() => setServicioSeleccionado(null)}>✕</button>
                            </div>

                            <div className="modal-body-scroll">
                                <div className="modal-tags-meta">
                                    <span className="tag-categoria-pill">{servicioSeleccionado.categoria}</span>
                                    <span>⏱ {servicioSeleccionado.duracion_minutos} minutos de sesión</span>
                                    <span className="precio-modal">${Number(servicioSeleccionado.precio).toLocaleString()} COP</span>
                                </div>

                                <div className="modal-campo-bloque">
                                    <h5>Descripción Detallada</h5>
                                    <p>{servicioSeleccionado.descripcion}</p>
                                </div>

                                {/* Recursos multimedia (HU-008 / HU-010 Criterio 4) */}
                                <div className="modal-campo-bloque">
                                    <h5>Galería y Referencias Visuales</h5>
                                    {!servicioSeleccionado.recursos || servicioSeleccionado.recursos.length === 0 ? (
                                        <p className="sin-media-txt">No se ha registrado contenido multimedia para este servicio.</p>
                                    ) : (
                                        <div className="modal-galeria-grid">
                                            {servicioSeleccionado.recursos.map((r) => (
                                                <div key={r.id_recurso} className="galeria-thumb">
                                                    {r.tipo === 'F' ? (
                                                        <img src={r.url_archivo} alt="Foto de referencia" />
                                                    ) : (
                                                        <video src={r.url_archivo} controls />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-solicitar-modal"
                                    onClick={() => {
                                        const s = servicioSeleccionado;
                                        setServicioSeleccionado(null);
                                        alert(`Procediendo a crear solicitud para ${s.nombre} (HU-012)`);
                                    }}
                                >
                                    Reservar este Servicio
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}