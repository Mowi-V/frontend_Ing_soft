import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import EstadoBadge from '../components/common/EstadoBadge';
import { solicitudesService } from '../services/solicitudes.service';
import { ESTADOS_SOLICITUD } from '../utils/constants';
import './MisSolicitudes.css';

const FILTROS = [
    { id: 'TODOS', label: 'Todas' },
    { id: 'P', label: 'Pendientes' },
    { id: 'S', label: 'Sugeridas' },
    { id: 'A', label: 'Aceptadas' },
    { id: 'F', label: 'Finalizadas' },
    { id: 'R', label: 'Rechazadas' },
    { id: 'C', label: 'Canceladas' }
];

export default function MisSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('TODOS');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [solicitudARechazarContra, setSolicitudARechazarContra] = useState(null);
    const [motivoRechazoContra, setMotivoRechazoContra] = useState('');
    const [errorModalRechazoContra, setErrorModalRechazoContra] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null);
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

    const handleAceptarContrapropuesta = async (solicitud) => {
        setProcesandoId(solicitud.id_solicitud);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.responderContrapropuesta(solicitud.id_solicitud, 'aceptar');
            setMensaje(data.msg || `Contrapropuesta aceptada. Cita #${solicitud.id_solicitud} confirmada.`);

            if (solicitudSeleccionada?.id_solicitud === solicitud.id_solicitud) {
                setSolicitudSeleccionada(null);
            }

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setError(err.message || 'No fue posible aceptar la contrapropuesta');
            if (err.status === 409) {
                await cargarSolicitudes(filtroSeleccionado);
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const abrirModalRechazoContra = (solicitud) => {
        setSolicitudARechazarContra(solicitud);
        setMotivoRechazoContra('');
        setErrorModalRechazoContra(null);
    };

    const cerrarModalRechazoContra = () => {
        if (procesandoId === solicitudARechazarContra?.id_solicitud) return;
        setSolicitudARechazarContra(null);
        setMotivoRechazoContra('');
        setErrorModalRechazoContra(null);
    };

    const handleConfirmarRechazoContra = async (e) => {
        e.preventDefault();
        if (!solicitudARechazarContra) return;

        const motivoLimpio = motivoRechazoContra.trim();
        if (!motivoLimpio) {
            setErrorModalRechazoContra('Debes indicar el motivo para rechazar la contrapropuesta.');
            return;
        }
        if (motivoLimpio.length > 255) {
            setErrorModalRechazoContra('El motivo no puede superar los 255 caracteres.');
            return;
        }

        setProcesandoId(solicitudARechazarContra.id_solicitud);
        setErrorModalRechazoContra(null);
        setError(null);
        setMensaje(null);

        try {
            const data = await solicitudesService.responderContrapropuesta(
                solicitudARechazarContra.id_solicitud,
                'rechazar',
                motivoLimpio
            );
            setMensaje(data.msg || `Contrapropuesta rechazada y solicitud #${solicitudARechazarContra.id_solicitud} cancelada.`);

            if (solicitudSeleccionada?.id_solicitud === solicitudARechazarContra.id_solicitud) {
                setSolicitudSeleccionada(null);
            }
            setSolicitudARechazarContra(null);
            setMotivoRechazoContra('');

            await cargarSolicitudes(filtroSeleccionado);
        } catch (err) {
            setErrorModalRechazoContra(err.message || 'No fue posible rechazar la contrapropuesta');
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

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
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
                                        <div className="acciones-card-cliente">
                                            {s.estado === ESTADOS_SOLICITUD.SUGERIDA && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-aceptar-contra"
                                                        onClick={() => handleAceptarContrapropuesta(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        {procesandoId === s.id_solicitud ? 'Confirmando...' : 'Aceptar Nuevo Horario'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-rechazar-contra"
                                                        onClick={() => abrirModalRechazoContra(s)}
                                                        disabled={procesandoId === s.id_solicitud}
                                                    >
                                                        Rechazar Propuesta
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                className="btn-ver-detalle-solic"
                                                onClick={() => setSolicitudSeleccionada(s)}
                                            >
                                                Ver Detalle
                                            </button>
                                        </div>
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

                            <div className="modal-footer modal-footer-cliente-acciones">
                                {solicitudSeleccionada.estado === ESTADOS_SOLICITUD.SUGERIDA && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-aceptar-contra"
                                            onClick={() => handleAceptarContrapropuesta(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            {procesandoId === solicitudSeleccionada.id_solicitud ? 'Confirmando...' : 'Aceptar Nuevo Horario'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-rechazar-contra"
                                            onClick={() => abrirModalRechazoContra(solicitudSeleccionada)}
                                            disabled={procesandoId === solicitudSeleccionada.id_solicitud}
                                        >
                                            Rechazar Propuesta
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

                {/* MODAL DE RECHAZO DE CONTRAPROPUESTA (HU-018) */}
                {solicitudARechazarContra && (
                    <div className="modal-overlay" onClick={cerrarModalRechazoContra}>
                        <div className="modal-solicitud-card modal-rechazo-contra-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <span className="modal-sub-id">Rechazar Contrapropuesta · Solicitud #{solicitudARechazarContra.id_solicitud}</span>
                                    <h3>{solicitudARechazarContra.nombre_servicio_c}</h3>
                                </div>
                                <button type="button" className="btn-close-modal" onClick={cerrarModalRechazoContra}>
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleConfirmarRechazoContra} className="modal-rechazo-contra-form">
                                <div className="modal-body-scroll">
                                    <div className="resumen-contra-box">
                                        <p>
                                            <strong>Horario propuesto por el profesional:</strong>{' '}
                                            {formatearFechaHora(solicitudARechazarContra.fecha_hora_sugerida)}
                                        </p>
                                    </div>

                                    <p className="contra-instruccion">
                                        Si el nuevo horario no se ajusta a tu disponibilidad, indica el motivo para cancelar la solicitud.
                                    </p>

                                    {errorModalRechazoContra && (
                                        <div className="modal-error-cliente-inline" role="alert">
                                            {errorModalRechazoContra}
                                        </div>
                                    )}

                                    <div className="campo-motivo-cliente-group">
                                        <label htmlFor="motivo-rechazo-contra-input">Motivo de rechazo *</label>
                                        <textarea
                                            id="motivo-rechazo-contra-input"
                                            className="textarea-motivo-cliente"
                                            rows="4"
                                            maxLength={255}
                                            value={motivoRechazoContra}
                                            onChange={(e) => setMotivoRechazoContra(e.target.value)}
                                            placeholder="Ej. El horario sugerido no me es posible por cruce con mis actividades."
                                            disabled={procesandoId === solicitudARechazarContra.id_solicitud}
                                            required
                                        />
                                        <span className="contador-caracteres-cliente">{motivoRechazoContra.length}/255 caracteres</span>
                                    </div>
                                </div>

                                <div className="modal-footer modal-footer-cliente-acciones">
                                    <button
                                        type="button"
                                        className="btn-modal-cerrar"
                                        onClick={cerrarModalRechazoContra}
                                        disabled={procesandoId === solicitudARechazarContra.id_solicitud}
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-rechazar-contra-confirmar"
                                        disabled={procesandoId === solicitudARechazarContra.id_solicitud}
                                    >
                                        {procesandoId === solicitudARechazarContra.id_solicitud ? 'Procesando...' : 'Rechazar y Cancelar'}
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