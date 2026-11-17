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
    const [solicitudARechazar, setSolicitudARechazar] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [errorModalRechazo, setErrorModalRechazo] = useState(null);
    const [solicitudAContraproponer, setSolicitudAContraproponer] = useState(null);
    const [fechaSugeridaInput, setFechaSugeridaInput] = useState('');
    const [minFechaLocal, setMinFechaLocal] = useState('');
    const [errorModalContrapropuesta, setErrorModalContrapropuesta] = useState(null);
    const [solicitudACancelar, setSolicitudACancelar] = useState(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [errorModalCancelacion, setErrorModalCancelacion] = useState(null);
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

    const abrirModalRechazo = (solicitud) => {
        setSolicitudARechazar(solicitud);
        setMotivoRechazo('');
        setErrorModalRechazo(null);
    };

    const cerrarModalRechazo = () => {
        if (procesandoId === solicitudARechazar?.id_solicitud) return;
        setSolicitudARechazar(null);
        setMotivoRechazo('');
        setErrorModalRechazo(null);
    };

    const handleConfirmarRechazo = async (e) => {
        e.preventDefault();
        if (!solicitudARechazar) return;

        const motivoLimpio = motivoRechazo.trim();
        if (!motivoLimpio) {
            setErrorModalRechazo('Debes indicar el motivo del rechazo para informar al cliente.');
            return;
        }
        if (motivoLimpio.length > 255) {
            setErrorModalRechazo('El motivo no puede superar los 255 caracteres.');
            return;
        }

        setProcesandoId(solicitudARechazar.id_solicitud);
        setErrorModalRechazo(null);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.rechazarSolicitud(solicitudARechazar.id_solicitud, motivoLimpio);
            setMensaje(data.msg || `Solicitud #${solicitudARechazar.id_solicitud} rechazada.`);

            if (solicitudSeleccionada?.id_solicitud === solicitudARechazar.id_solicitud) {
                setSolicitudSeleccionada(null);
            }
            setSolicitudARechazar(null);
            setMotivoRechazo('');

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setErrorModalRechazo(err.message || 'No fue posible rechazar la solicitud');
            if (err.status === 409) {
                await cargarSolicitudes(filtroSeleccionado);
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const obtenerMinFechaLocal = () => {
        const d = new Date(Date.now() + 60 * 1000);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${day}T${h}:${min}`;
    };

    const abrirModalContrapropuesta = (solicitud) => {
        setSolicitudAContraproponer(solicitud);
        setFechaSugeridaInput('');
        setMinFechaLocal(obtenerMinFechaLocal());
        setErrorModalContrapropuesta(null);
    };

    const cerrarModalContrapropuesta = () => {
        if (procesandoId === solicitudAContraproponer?.id_solicitud) return;
        setSolicitudAContraproponer(null);
        setFechaSugeridaInput('');
        setErrorModalContrapropuesta(null);
    };

    const handleConfirmarContrapropuesta = async (e) => {
        e.preventDefault();
        if (!solicitudAContraproponer) return;

        if (!fechaSugeridaInput) {
            setErrorModalContrapropuesta('Debes seleccionar una nueva fecha y hora.');
            return;
        }

        setProcesandoId(solicitudAContraproponer.id_solicitud);
        setErrorModalContrapropuesta(null);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.contraproponerSolicitud(
                solicitudAContraproponer.id_solicitud,
                fechaSugeridaInput
            );
            setMensaje(data.msg || `Contrapropuesta enviada para la solicitud #${solicitudAContraproponer.id_solicitud}.`);

            if (solicitudSeleccionada?.id_solicitud === solicitudAContraproponer.id_solicitud) {
                setSolicitudSeleccionada(null);
            }
            setSolicitudAContraproponer(null);
            setFechaSugeridaInput('');

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setErrorModalContrapropuesta(err.message || 'No fue posible enviar la contrapropuesta');
            if (err.status === 409) {
                await cargarSolicitudes(filtroSeleccionado);
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const abrirModalCancelacion = (solicitud) => {
        setSolicitudACancelar(solicitud);
        setMotivoCancelacion('');
        setErrorModalCancelacion(null);
    };

    const cerrarModalCancelacion = () => {
        if (procesandoId === solicitudACancelar?.id_solicitud) return;
        setSolicitudACancelar(null);
        setMotivoCancelacion('');
        setErrorModalCancelacion(null);
    };

    const handleConfirmarCancelacion = async (e) => {
        e.preventDefault();
        if (!solicitudACancelar) return;

        const motivoLimpio = motivoCancelacion.trim();
        if (!motivoLimpio) {
            setErrorModalCancelacion('Debes indicar el motivo de la cancelación para informar al cliente.');
            return;
        }
        if (motivoLimpio.length > 255) {
            setErrorModalCancelacion('El motivo no puede superar los 255 caracteres.');
            return;
        }

        setProcesandoId(solicitudACancelar.id_solicitud);
        setErrorModalCancelacion(null);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.cancelarSolicitud(solicitudACancelar.id_solicitud, motivoLimpio);
            setMensaje(data.msg || `Reserva #${solicitudACancelar.id_solicitud} cancelada.`);

            if (solicitudSeleccionada?.id_solicitud === solicitudACancelar.id_solicitud) {
                setSolicitudSeleccionada(null);
            }
            setSolicitudACancelar(null);
            setMotivoCancelacion('');

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setErrorModalCancelacion(err.message || 'No fue posible cancelar la reserva');
            if (err.status === 409) {
                await cargarSolicitudes(filtroSeleccionado);
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const handleFinalizarSolicitud = async (solicitud) => {
        setProcesandoId(solicitud.id_solicitud);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.finalizarSolicitud(solicitud.id_solicitud);
            setMensaje(data.msg || `Servicio #${solicitud.id_solicitud} marcado como finalizado.`);

            if (solicitudSeleccionada?.id_solicitud === solicitud.id_solicitud) {
                setSolicitudSeleccionada(null);
            }

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setError(err.message || 'No fue posible finalizar el servicio');
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
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-aceptar-prov"
                                                        onClick={() => handleAceptarSolicitud(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        {procesandoId === s.id_solicitud ? 'Confirmando...' : 'Aceptar Cita'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-contraproponer-prov"
                                                        onClick={() => abrirModalContrapropuesta(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        Proponer Horario
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-rechazar-prov"
                                                        onClick={() => abrirModalRechazo(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}
                                            {s.estado === ESTADOS_SOLICITUD.ACEPTADA && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-finalizar-prov"
                                                        onClick={() => handleFinalizarSolicitud(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        {procesandoId === s.id_solicitud ? 'Finalizando...' : 'Marcar Finalizado'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-rechazar-prov"
                                                        onClick={() => abrirModalCancelacion(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        Cancelar Reserva
                                                    </button>
                                                </>
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
                                    <>
                                        <button
                                            type="button"
                                            className="btn-aceptar-prov"
                                            onClick={() => handleAceptarSolicitud(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            {procesandoId === solicitudSeleccionada.id_solicitud ? 'Confirmando...' : 'Aceptar Cita'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-contraproponer-prov"
                                            onClick={() => abrirModalContrapropuesta(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            Proponer Horario
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-rechazar-prov"
                                            onClick={() => abrirModalRechazo(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                )}
                                {solicitudSeleccionada.estado === ESTADOS_SOLICITUD.ACEPTADA && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-finalizar-prov"
                                            onClick={() => handleFinalizarSolicitud(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            {procesandoId === solicitudSeleccionada.id_solicitud ? 'Finalizando...' : 'Marcar Finalizado'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-rechazar-prov"
                                            onClick={() => abrirModalCancelacion(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            Cancelar Reserva
                                        </button>
                                    </>
                                )}
                                <button type="button" className="btn-modal-cerrar" onClick={() => setSolicitudSeleccionada(null)}>
                                    Cerrar Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE RECHAZO CON MOTIVO OBLIGATORIO (HU-016) */}
                {solicitudARechazar && (
                    <div className="modal-overlay" onClick={cerrarModalRechazo}>
                        <div className="modal-prov-card modal-rechazo-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <span className="modal-sub-id">Rechazar Solicitud #{solicitudARechazar.id_solicitud}</span>
                                    <h3>{solicitudARechazar.nombre_servicio_c}</h3>
                                </div>
                                <button type="button" className="btn-close-modal" onClick={cerrarModalRechazo}>
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleConfirmarRechazo} className="modal-rechazo-form">
                                <div className="modal-body-scroll">
                                    <p className="rechazo-instruccion">
                                        Indica el motivo por el cual no puedes atender esta solicitud. Este mensaje será visible para el cliente.
                                    </p>

                                    {errorModalRechazo && (
                                        <div className="modal-error-inline" role="alert">
                                            {errorModalRechazo}
                                        </div>
                                    )}

                                    <div className="campo-motivo-group">
                                        <label htmlFor="motivo-rechazo-input">Motivo del rechazo *</label>
                                        <textarea
                                            id="motivo-rechazo-input"
                                            className="textarea-motivo"
                                            rows="4"
                                            maxLength={255}
                                            value={motivoRechazo}
                                            onChange={(e) => setMotivoRechazo(e.target.value)}
                                            placeholder="Ej. Zona fuera de mi cobertura habitual o disponibilidad ocupada en ese horario."
                                            disabled={procesandoId === solicitudARechazar.id_solicitud}
                                            required
                                        />
                                        <span className="contador-caracteres">{motivoRechazo.length}/255 caracteres</span>
                                    </div>
                                </div>

                                <div className="modal-footer modal-footer-acciones">
                                    <button
                                        type="button"
                                        className="btn-modal-cerrar"
                                        onClick={cerrarModalRechazo}
                                        disabled={procesandoId === solicitudARechazar.id_solicitud}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-rechazar-confirmar"
                                        disabled={procesandoId === solicitudARechazar.id_solicitud}
                                    >
                                        {procesandoId === solicitudARechazar.id_solicitud ? 'Rechazando...' : 'Confirmar Rechazo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DE CONTRAPROPUESTA HORARIA (HU-017) */}
                {solicitudAContraproponer && (
                    <div className="modal-overlay" onClick={cerrarModalContrapropuesta}>
                        <div className="modal-prov-card modal-rechazo-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <span className="modal-sub-id">Contrapropuesta · Solicitud #{solicitudAContraproponer.id_solicitud}</span>
                                    <h3>{solicitudAContraproponer.nombre_servicio_c}</h3>
                                </div>
                                <button type="button" className="btn-close-modal" onClick={cerrarModalContrapropuesta}>
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleConfirmarContrapropuesta} className="modal-rechazo-form">
                                <div className="modal-body-scroll">
                                    <div className="resumen-original-box">
                                        <p>
                                            <strong>Horario solicitado por el cliente:</strong>{' '}
                                            {formatearFechaHora(solicitudAContraproponer.fecha_hora_solicitada)}
                                        </p>
                                        <p>
                                            <strong>Duración del servicio:</strong> {solicitudAContraproponer.duracion_minutos_c} minutos
                                        </p>
                                    </div>

                                    <p className="rechazo-instruccion">
                                        Propón una nueva fecha y hora dentro de tu disponibilidad habitual sin cruces con citas confirmadas.
                                    </p>

                                    {errorModalContrapropuesta && (
                                        <div className="modal-error-inline" role="alert">
                                            {errorModalContrapropuesta}
                                        </div>
                                    )}

                                    <div className="campo-motivo-group">
                                        <label htmlFor="fecha-sugerida-input">Nueva fecha y hora propuesta *</label>
                                        <input
                                            id="fecha-sugerida-input"
                                            type="datetime-local"
                                            className="input-datetime-contrapropuesta"
                                            min={minFechaLocal}
                                            value={fechaSugeridaInput}
                                            onChange={(e) => setFechaSugeridaInput(e.target.value)}
                                            disabled={procesandoId === solicitudAContraproponer.id_solicitud}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer modal-footer-acciones">
                                    <button
                                        type="button"
                                        className="btn-modal-cerrar"
                                        onClick={cerrarModalContrapropuesta}
                                        disabled={procesandoId === solicitudAContraproponer.id_solicitud}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-contraproponer-confirmar"
                                        disabled={procesandoId === solicitudAContraproponer.id_solicitud}
                                    >
                                        {procesandoId === solicitudAContraproponer.id_solicitud ? 'Enviando...' : 'Enviar Contrapropuesta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DE CANCELACIÓN DE RESERVA (HU-019) */}
                {solicitudACancelar && (
                    <div className="modal-overlay" onClick={cerrarModalCancelacion}>
                        <div className="modal-prov-card modal-rechazo-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <span className="modal-sub-id">Cancelar Reserva #{solicitudACancelar.id_solicitud}</span>
                                    <h3>{solicitudACancelar.nombre_servicio_c}</h3>
                                </div>
                                <button type="button" className="btn-close-modal" onClick={cerrarModalCancelacion}>
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleConfirmarCancelacion} className="modal-rechazo-form">
                                <div className="modal-body-scroll">
                                    <p className="rechazo-instruccion">
                                        Al cancelar esta reserva confirmada se notificará el motivo al cliente y el horario quedará nuevamente libre en tu agenda.
                                    </p>

                                    {errorModalCancelacion && (
                                        <div className="modal-error-inline" role="alert">
                                            {errorModalCancelacion}
                                        </div>
                                    )}

                                    <div className="campo-motivo-group">
                                        <label htmlFor="motivo-cancelacion-prov-input">Motivo de cancelación *</label>
                                        <textarea
                                            id="motivo-cancelacion-prov-input"
                                            className="textarea-motivo"
                                            rows="4"
                                            maxLength={255}
                                            value={motivoCancelacion}
                                            onChange={(e) => setMotivoCancelacion(e.target.value)}
                                            placeholder="Ej. Incapacidad médica o contratiempo de fuerza mayor."
                                            disabled={procesandoId === solicitudACancelar.id_solicitud}
                                            required
                                        />
                                        <span className="contador-caracteres">{motivoCancelacion.length}/255 caracteres</span>
                                    </div>
                                </div>

                                <div className="modal-footer modal-footer-acciones">
                                    <button
                                        type="button"
                                        className="btn-modal-cerrar"
                                        onClick={cerrarModalCancelacion}
                                        disabled={procesandoId === solicitudACancelar.id_solicitud}
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-rechazar-confirmar"
                                        disabled={procesandoId === solicitudACancelar.id_solicitud}
                                    >
                                        {procesandoId === solicitudACancelar.id_solicitud ? 'Cancelando...' : 'Confirmar Cancelación'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}