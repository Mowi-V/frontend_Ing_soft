import { useEffect, useState } from 'react';
import NavbarProveedor from '../components/NavbarProveedor';
import Alerta from '../components/common/Alerta';
import EstadoBadge from '../components/common/EstadoBadge';
import { solicitudesService } from '../services/solicitudes.service';
import { ESTADOS_SOLICITUD } from '../utils/constants';
import './SolicitudesProveedor.css';

const FILTROS = [
    { id: 'TODOS', label: 'Todas' },
    { id: 'P', label: 'Pendientes' },
    { id: 'S', label: 'Sugeridas' },
    { id: 'A', label: 'Aceptadas' },
    { id: 'F', label: 'Finalizadas' },
    { id: 'R', label: 'Rechazadas' },
    { id: 'C', label: 'Canceladas' }
];

export default function SolicitudesProveedor() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('P'); // Prioriza 'Pendientes' por defecto
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const cargarSolicitudes = async (filtro) => {
        setCargando(true);
        setError(null);
        try {
            const data = await solicitudesService.obtenerSolicitudesProveedor(filtro);
            setSolicitudes(data.solicitudes || []);
        } catch (err) {
            setError(err.message || 'Error al cargar las solicitudes recibidas');
        } finally {
            setCargando(false);
        }
    };

    const handleAceptarSolicitud = async (solicitud) => {
        setProcesandoId(solicitud.id_solicitud);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.aceptarSolicitud(solicitud.id_solicitud);
            setMensaje(data.msg || `Solicitud #${solicitud.id_solicitud} aceptada y confirmada en tu agenda.`);

            if (solicitudSeleccionada?.id_solicitud === solicitud.id_solicitud) {
                setSolicitudSeleccionada(null);
            }

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setError(err.message || 'No fue posible aceptar la solicitud');
            if (err.status === 409) {
                await cargarSolicitudes(filtroSeleccionado);
            }
        } finally {
            setProcesandoId(null);
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
        <div className="solic-prov-wrapper">
            <NavbarProveedor />

            <main className="solic-prov-container">
                <header className="solic-prov-header">
                    <div>
                        <h1>Bandeja de Solicitudes Recibidas</h1>
                        <p>Revisa las solicitudes de citas de tus clientes, direcciones y planifica tu agenda.</p>
                    </div>
                </header>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {/* BARRA DE FILTROS */}
                <div className="solic-prov-filtros">
                    {FILTROS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            className={`filtro-prov-pill ${filtroSeleccionado === f.id ? 'activo' : ''}`}
                            onClick={() => setFiltroSeleccionado(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {cargando ? (
                    <p className="solic-prov-loading">Cargando solicitudes recibidas...</p>
                ) : solicitudes.length === 0 ? (
                    <div className="solic-prov-empty">
                        <span className="empty-prov-icon">📬</span>
                        <h3>No tienes solicitudes {filtroSeleccionado === 'P' ? 'pendientes' : 'en esta sección'}</h3>
                        <p>Cuando un cliente agende uno de tus servicios, aparecerá listado aquí con su dirección exacta.</p>
                    </div>
                ) : (
                    <div className="solic-prov-grid">
                        {solicitudes.map((s) => {
                            const nombreCliente = s.cliente?.Usuario 
                                ? `${s.cliente.Usuario.nombre} ${s.cliente.Usuario.apellido || ''}`.trim()
                                : 'Cliente registrado';

                            const comunaNombre = s.barrio?.Comuna?.nombre || '';

                            return (
                                <article key={s.id_solicitud} className="card-solicitud-prov">
                                    <div className="card-prov-header">
                                        <EstadoBadge estado={s.estado} />
                                        <span className="orden-prov-id">Cita #{s.id_solicitud}</span>
                                    </div>

                                    <h3 className="servicio-prov-title">{s.nombre_servicio_c}</h3>

                                    <div className="cliente-meta-box">
                                        <p className="cliente-nombre-txt">👤 Cliente: <strong>{nombreCliente}</strong></p>
                                        <p className="cliente-correo-txt">✉️ {s.cliente?.Usuario?.correo_electronico}</p>
                                    </div>

                                    <div className="horario-cita-box">
                                        <div className="horario-row">
                                            <span className="horario-tag-label">Fecha y Hora Solicitada:</span>
                                            <span className="horario-val">{formatearFechaHora(s.fecha_hora_solicitada)}</span>
                                        </div>

                                        {s.estado === 'S' && s.fecha_hora_sugerida && (
                                            <div className="horario-row horario-sugerido-row">
                                                <span className="horario-tag-label">Horario Sugerido Enviado:</span>
                                                <span className="horario-val">{formatearFechaHora(s.fecha_hora_sugerida)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* DIRECCIÓN DE ATENCIÓN DESTACADA (RF-25) */}
                                    <div className="direccion-atencion-box">
                                        <span className="dir-label">Dirección de Atención Domiciliaria:</span>
                                        <span className="dir-calle">📍 {s.direccion_atencion}</span>
                                        <span className="dir-barrio">Barrio: {s.barrio_sector} {comunaNombre ? `(${comunaNombre})` : ''}</span>
                                        {s.informacion_complementaria && (
                                            <span className="dir-info-extra">Detalles: {s.informacion_complementaria}</span>
                                        )}
                                    </div>

                                    <div className="card-prov-footer">
                                        <div className="precio-duracion-col">
                                            <span className="tarifa-congelada">${Number(s.precio_c).toLocaleString()} COP</span>
                                            <span className="duracion-congelada">⏱ {s.duracion_minutos_c} minutos</span>
                                        </div>
                                        <div className="acciones-card-prov">
                                            {s.estado === ESTADOS_SOLICITUD.PENDIENTE && (
                                                <button
                                                    type="button"
                                                    className="btn-aceptar-prov"
                                                    onClick={() => handleAceptarSolicitud(s)}
                                                    disabled={procesandoId === s.id_solicitud}
                                                >
                                                    {procesandoId === s.id_solicitud ? 'Confirmando...' : 'Aceptar Cita'}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn-ver-detalle-prov"
                                                onClick={() => setSolicitudSeleccionada(s)}
                                            >
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* MODAL DE DETALLE OPERATIVO */}
                {solicitudSeleccionada && (
                    <div className="modal-overlay" onClick={() => setSolicitudSeleccionada(null)}>
                        <div className="modal-prov-card" onClick={(e) => e.stopPropagation()}>
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
                                <div className="modal-status-bar">
                                    <span className="status-label">Estado de la Cita:</span>
                                    <EstadoBadge estado={solicitudSeleccionada.estado} />
                                </div>

                                <div className="modal-seccion-bloque">
                                    <h4>Datos de Contacto del Cliente</h4>
                                    <p><strong>Nombre:</strong> {solicitudSeleccionada.cliente?.Usuario?.nombre} {solicitudSeleccionada.cliente?.Usuario?.apellido}</p>
                                    <p><strong>Correo Electrónico:</strong> {solicitudSeleccionada.cliente?.Usuario?.correo_electronico}</p>
                                </div>

                                <div className="modal-seccion-bloque">
                                    <h4>Lugar de Prestación del Servicio</h4>
                                    <p><strong>Dirección:</strong> {solicitudSeleccionada.direccion_atencion}</p>
                                    <p><strong>Barrio / Sector:</strong> {solicitudSeleccionada.barrio_sector}</p>
                                    {solicitudSeleccionada.informacion_complementaria && (
                                        <p><strong>Indicaciones de llegada:</strong> {solicitudSeleccionada.informacion_complementaria}</p>
                                    )}
                                </div>

                                <div className="modal-seccion-bloque">
                                    <h4>Condiciones Comerciales Acordadas (Inmutables)</h4>
                                    <div className="condiciones-grid">
                                        <div>
                                            <span className="sub-txt">Tarifa Pactada:</span>
                                            <strong className="val-txt">${Number(solicitudSeleccionada.precio_c).toLocaleString()} COP</strong>
                                        </div>
                                        <div>
                                            <span className="sub-txt">Duración de Sesión:</span>
                                            <strong className="val-txt">{solicitudSeleccionada.duracion_minutos_c} min</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-seccion-bloque">
                                    <h4>Programación y Fechas</h4>
                                    <p><strong>Horario Solicitado:</strong> {formatearFechaHora(solicitudSeleccionada.fecha_hora_solicitada)}</p>
                                    {solicitudSeleccionada.fecha_hora_sugerida && (
                                        <p className="sugerida-alerta-txt">
                                            <strong>Contrapropuesta Enviada:</strong> {formatearFechaHora(solicitudSeleccionada.fecha_hora_sugerida)}
                                        </p>
                                    )}
                                    <p className="fechas-audit-txt">Creada el: {formatearFechaHora(solicitudSeleccionada.fecha_creacion)}</p>
                                    <p className="fechas-audit-txt">Última actualización: {formatearFechaHora(solicitudSeleccionada.fecha_ultima_actualizacion)}</p>
                                </div>

                                {solicitudSeleccionada.observaciones && (
                                    <div className="modal-seccion-bloque">
                                        <h4>Observaciones del Cliente</h4>
                                        <p className="observaciones-txt">{solicitudSeleccionada.observaciones}</p>
                                    </div>
                                )}

                                {solicitudSeleccionada.motivo_rechazo_cancelacion && (
                                    <div className="modal-rechazo-bloque">
                                        <h4>Motivo de Cancelación / Rechazo:</h4>
                                        <p>{solicitudSeleccionada.motivo_rechazo_cancelacion}</p>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer modal-footer-acciones">
                                {solicitudSeleccionada.estado === ESTADOS_SOLICITUD.PENDIENTE && (
                                    <button
                                        type="button"
                                        className="btn-aceptar-prov"
                                        onClick={() => handleAceptarSolicitud(solicitudSeleccionada)}
                                        disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                    >
                                        {procesandoId === solicitudSeleccionada.id_solicitud ? 'Confirmando...' : 'Aceptar Cita'}
                                    </button>
                                )}
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