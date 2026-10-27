import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import EstadoBadge from '../components/common/EstadoBadge';
import { solicitudesService } from '../services/solicitudes.service';
import './MisSolicitudes.css';

const FILTROS = [
    { id: 'TODOS', label: 'Todas' },
    { id: 'P', label: 'Pendientes' },
    { id: 'A', label: 'Aceptadas' },
    { id: 'S', label: 'Sugeridas' },
    { id: 'F', label: 'Finalizadas' },
    { id: 'C', label: 'Canceladas / Rechazadas' }
];

export default function MisSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('TODOS');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarSolicitudes = async (filtro) => {
        setCargando(true);
        setError(null);
        try {
            const data = await solicitudesService.obtenerMisSolicitudesCliente(filtro);
            setSolicitudes(data.solicitudes || []);
        } catch (err) {
            setError(err.message || 'Error al cargar tus solicitudes');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarSolicitudes(filtroSeleccionado);
    }, [filtroSeleccionado]);

    const formatearFechaHora = (fechaIso) => {
        if (!fechaIso) return 'No definida';
        const d = new Date(fechaIso);
        return d.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mis-solicitudes-wrapper">
            <Navbar />

            <main className="mis-solicitudes-container">
                <header className="solicitudes-header">
                    <div>
                        <h1>Mis Solicitudes y Reservas</h1>
                        <p>Haz seguimiento al estado de tus servicios agendados a domicilio.</p>
                    </div>
                    <Link to="/dashboard-cliente" className="btn-agendar-nuevo">
                        + Solicitar Nuevo Servicio
                    </Link>
                </header>

                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {/* FILTROS POR ESTADO */}
                <div className="solicitudes-filtros-bar">
                    {FILTROS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            className={`filtro-pill ${filtroSeleccionado === f.id ? 'activo' : ''}`}
                            onClick={() => setFiltroSeleccionado(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {cargando ? (
                    <p className="solicitudes-loading">Cargando tus solicitudes...</p>
                ) : solicitudes.length === 0 ? (
                    <div className="solicitudes-empty-card">
                        <span className="empty-icon">📅</span>
                        <h3>No tienes solicitudes registradas</h3>
                        <p>No se encontraron citas bajo el filtro seleccionado. Explora nuestro catálogo y agenda tu primer servicio.</p>
                        <Link to="/dashboard-cliente" className="btn-explorar-empty">
                            Explorar Servicios
                        </Link>
                    </div>
                ) : (
                    <div className="solicitudes-grid">
                        {solicitudes.map((s) => {
                            const nombreProv = s.proveedor?.Usuario 
                                ? `${s.proveedor.Usuario.nombre} ${s.proveedor.Usuario.apellido || ''}`.trim()
                                : 'Profesional asignado';

                            const comunaNombre = s.barrio?.Comuna?.nombre || '';

                            return (
                                <article key={s.id_solicitud} className="solicitud-card">
                                    <div className="solicitud-card-top">
                                        <EstadoBadge estado={s.estado} />
                                        <span className="solicitud-id">Orden #{s.id_solicitud}</span>
                                    </div>

                                    <h3 className="solicitud-servicio-nombre">{s.nombre_servicio_c}</h3>

                                    <p className="solicitud-prov-nombre">
                                        👤 Profesional: <strong>{nombreProv}</strong>
                                    </p>

                                    <div className="solicitud-fechas-bloque">
                                        <div className="fecha-item">
                                            <span className="fecha-label">Fecha Solicitada:</span>
                                            <span className="fecha-valor">{formatearFechaHora(s.fecha_hora_solicitada)}</span>
                                        </div>

                                        {s.estado === 'S' && s.fecha_hora_sugerida && (
                                            <div className="fecha-item fecha-sugerida-highlight">
                                                <span className="fecha-label">Horario Propuesto por Proveedor:</span>
                                                <span className="fecha-valor">{formatearFechaHora(s.fecha_hora_sugerida)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="solicitud-lugar-bloque">
                                        <span>📍 {s.direccion_atencion}</span>
                                        <span className="lugar-barrio">{s.barrio_sector} {comunaNombre ? `(${comunaNombre})` : ''}</span>
                                    </div>

                                    <div className="solicitud-card-footer">
                                        <div className="solicitud-precio-duracion">
                                            <span className="solic-precio">${Number(s.precio_c).toLocaleString()} COP</span>
                                            <span className="solic-duracion">⏱ {s.duracion_minutos_c} min</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-ver-detalle-solic"
                                            onClick={() => setSolicitudSeleccionada(s)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* MODAL DE DETALLE COMPLETO (HU-013 Criterio 3 y 7) */}
                {solicitudSeleccionada && (
                    <div className="modal-overlay" onClick={() => setSolicitudSeleccionada(null)}>
                        <div className="modal-solicitud-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <span className="modal-sub-id">Solicitud #{solicitudSeleccionada.id_solicitud}</span>
                                    <h3>{solicitudSeleccionada.nombre_servicio_c}</h3>
                                </div>
                                <button type="button" className="btn-close-modal" onClick={() => setSolicitudSeleccionada(null)}>
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body-scroll">
                                <div className="modal-status-row">
                                    <span className="label-status">Estado Actual:</span>
                                    <EstadoBadge estado={solicitudSeleccionada.estado} />
                                </div>

                                <div className="modal-seccion-datos">
                                    <h4>Condiciones Comerciales Acordadas (Inmutables)</h4>
                                    <div className="datos-comerciales-grid">
                                        <div>
                                            <span className="campo-sub">Tarifa Pactada:</span>
                                            <strong className="campo-val">${Number(solicitudSeleccionada.precio_c).toLocaleString()} COP</strong>
                                        </div>
                                        <div>
                                            <span className="campo-sub">Duración de la Sesión:</span>
                                            <strong className="campo-val">{solicitudSeleccionada.duracion_minutos_c} minutos</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-seccion-datos">
                                    <h4>Fechas Principales</h4>
                                    <p><strong>Fecha Solicitada:</strong> {formatearFechaHora(solicitudSeleccionada.fecha_hora_solicitada)}</p>
                                    {solicitudSeleccionada.fecha_hora_sugerida && (
                                        <p className="txt-sugerida-alerta">
                                            <strong>Contrapropuesta del Profesional:</strong> {formatearFechaHora(solicitudSeleccionada.fecha_hora_sugerida)}
                                        </p>
                                    )}
                                    <p className="txt-meta-fechas">Fecha de registro: {formatearFechaHora(solicitudSeleccionada.fecha_creacion)}</p>
                                    <p className="txt-meta-fechas">Última actualización: {formatearFechaHora(solicitudSeleccionada.fecha_ultima_actualizacion)}</p>
                                </div>

                                <div className="modal-seccion-datos">
                                    <h4>Lugar de Prestación</h4>
                                    <p><strong>Dirección:</strong> {solicitudSeleccionada.direccion_atencion}</p>
                                    <p><strong>Barrio / Sector:</strong> {solicitudSeleccionada.barrio_sector}</p>
                                    {solicitudSeleccionada.informacion_complementaria && (
                                        <p><strong>Detalles:</strong> {solicitudSeleccionada.informacion_complementaria}</p>
                                    )}
                                </div>

                                {solicitudSeleccionada.observaciones && (
                                    <div className="modal-seccion-datos">
                                        <h4>Observaciones del Cliente</h4>
                                        <p className="texto-observacion">{solicitudSeleccionada.observaciones}</p>
                                    </div>
                                )}

                                {solicitudSeleccionada.motivo_rechazo_cancelacion && (
                                    <div className="modal-seccion-alerta-motivo">
                                        <h4>Motivo de Rechazo o Cancelación:</h4>
                                        <p>{solicitudSeleccionada.motivo_rechazo_cancelacion}</p>
                                    </div>
                                )}

                                <div className="modal-seccion-datos">
                                    <h4>Profesional a Cargo</h4>
                                    <p>
                                        👤 {solicitudSeleccionada.proveedor?.Usuario?.nombre} {solicitudSeleccionada.proveedor?.Usuario?.apellido}
                                    </p>
                                    <p className="txt-meta-fechas">
                                        ✉️ {solicitudSeleccionada.proveedor?.Usuario?.correo_electronico}
                                    </p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cerrar" onClick={() => setSolicitudSeleccionada(null)}>
                                    Cerrar Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}