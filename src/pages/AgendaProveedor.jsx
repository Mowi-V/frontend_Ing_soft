import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
import Alerta from '../components/common/Alerta';
import { disponibilidadService } from '../services/disponibilidad.service';
import { solicitudesService } from '../services/solicitudes.service';
import './AgendaProveedor.css';

const DIAS_SEMANA = [
    { id: 'LU', nombre: 'Lunes' },
    { id: 'MA', nombre: 'Martes' },
    { id: 'MI', nombre: 'Miércoles' },
    { id: 'JU', nombre: 'Jueves' },
    { id: 'VI', nombre: 'Viernes' },
    { id: 'SA', nombre: 'Sábado' },
    { id: 'DO', nombre: 'Domingo' }
];

export default function AgendaProveedor() {
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [compromisos, setCompromisos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardandoFranja, setGuardandoFranja] = useState(false);
    const [guardandoBloqueo, setGuardandoBloqueo] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [formFranja, setFormFranja] = useState({
        dia: 'LU',
        hora_inicio: '08:00',
        hora_fin: '12:00'
    });

    const [formBloqueo, setFormBloqueo] = useState({
        fecha_inicio: '',
        fecha_fin: ''
    });

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);
        try {
            const [dataDisp, dataAgenda] = await Promise.all([
                disponibilidadService.obtenerMiDisponibilidad(),
                solicitudesService.obtenerAgendaProveedor()
            ]);
            setDisponibilidad(dataDisp.disponibilidad || []);
            setPeriodos(dataDisp.periodos_no_disponibles || []);
            setCompromisos(dataAgenda.agenda || []);
        } catch (err) {
            setError(err.message || 'Error al cargar los horarios y compromisos de tu agenda');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleAgregarFranja = async (e) => {
        e.preventDefault();
        setGuardandoFranja(true);
        setError(null);
        setMensaje(null);

        try {
            const res = await disponibilidadService.agregarFranja(
                formFranja.dia,
                formFranja.hora_inicio,
                formFranja.hora_fin
            );

            setDisponibilidad(prev => [...prev, res.franja]);
            setMensaje('Franja horaria agregada exitosamente.');
        } catch (err) {
            setError(err.message || 'Error al agregar la franja');
        } finally {
            setGuardandoFranja(false);
        }
    };

    const handleEliminarFranja = async (idDisponibilidad) => {
        setError(null);
        setMensaje(null);
        try {
            await disponibilidadService.eliminarFranja(idDisponibilidad);
            setDisponibilidad(prev => prev.filter(f => f.id_disponibilidad !== idDisponibilidad));
            setMensaje('Franja eliminada de tu agenda.');
        } catch (err) {
            setError(err.message || 'Error al eliminar la franja');
        }
    };

    const handleAgregarBloqueo = async (e) => {
        e.preventDefault();
        setGuardandoBloqueo(true);
        setError(null);
        setMensaje(null);

        try {
            const res = await disponibilidadService.agregarPeriodoNoDisponible(
                formBloqueo.fecha_inicio,
                formBloqueo.fecha_fin
            );

            setPeriodos(prev => [...prev, res.periodo]);
            setFormBloqueo({ fecha_inicio: '', fecha_fin: '' });
            setMensaje('Periodo no disponible registrado con éxito.');
        } catch (err) {
            setError(err.message || 'Error al registrar el bloqueo de fecha');
        } finally {
            setGuardandoBloqueo(false);
        }
    };

    const handleEliminarBloqueo = async (idPeriodo) => {
        setError(null);
        setMensaje(null);
        try {
            await disponibilidadService.eliminarPeriodoNoDisponible(idPeriodo);
            setPeriodos(prev => prev.filter(p => p.id !== idPeriodo));
            setMensaje('Bloqueo de agenda eliminado.');
        } catch (err) {
            setError(err.message || 'Error al eliminar el periodo');
        }
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        return String(fechaStr).slice(0, 10);
    };

    const formatearFechaDia = (ymd) => {
        if (!ymd) return 'Fecha por confirmar';
        const d = new Date(`${ymd}T12:00:00`);
        if (Number.isNaN(d.getTime())) return ymd;
        return d.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const compromisosPorDia = compromisos.reduce((acc, item) => {
        const clave = item.fecha || 'Sin fecha';
        if (!acc[clave]) acc[clave] = [];
        acc[clave].push(item);
        return acc;
    }, {});

    return (
        <div className="agenda-wrapper">
            <NavbarProveedor />

            <main className="agenda-container">
                <header className="agenda-header">
                    <h1>Mi Agenda y Disponibilidad</h1>
                    <p>Consulta tus compromisos confirmados en orden cronológico y configura tu horario habitual y descansos.</p>
                </header>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {cargando ? (
                    <p className="agenda-loading">Cargando agenda y configuración de horarios...</p>
                ) : (
                    <>
                        {/* AGENDA OPERATIVA DE COMPROMISOS CONFIRMADOS (HU-019) */}
                        <section className="agenda-card agenda-compromisos-section">
                            <div className="agenda-compromisos-header">
                                <div>
                                    <h2>Agenda de Servicios Confirmados ({compromisos.length})</h2>
                                    <p className="section-help">
                                        Próximas atenciones aceptadas en orden cronológico (no incluye solicitudes pendientes, rechazadas ni canceladas).
                                    </p>
                                </div>
                                <Link to="/solicitudes-proveedor" className="btn-gestionar-bandeja">
                                    Gestionar en Bandeja →
                                </Link>
                            </div>

                            {compromisos.length === 0 ? (
                                <div className="agenda-compromisos-empty">
                                    <span>📅</span>
                                    <div>
                                        <strong>No tienes servicios confirmados en tu agenda</strong>
                                        <p>Cuando aceptes solicitudes o el cliente confirme una contrapropuesta, aparecerán aquí organizadas por fecha y hora.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="agenda-dias-grupos">
                                    {Object.entries(compromisosPorDia).map(([fechaDia, citasDia]) => (
                                        <div key={fechaDia} className="agenda-dia-bloque">
                                            <h3 className="agenda-dia-titulo">{formatearFechaDia(fechaDia)}</h3>
                                            <div className="agenda-citas-lista">
                                                {citasDia.map((cita) => {
                                                    const nombreCliente = cita.cliente
                                                        ? `${cita.cliente.nombre} ${cita.cliente.apellido || ''}`.trim()
                                                        : 'Cliente registrado';
                                                    return (
                                                        <article key={cita.id_solicitud} className="agenda-cita-item">
                                                            <div className="agenda-cita-horario">
                                                                <span className="cita-rango-hora">
                                                                    {cita.hora_inicio} - {cita.hora_fin}
                                                                </span>
                                                                <span className="cita-duracion-tag">⏱ {cita.duracion_minutos_c} min</span>
                                                                <span className="cita-orden-tag">Cita #{cita.id_solicitud}</span>
                                                            </div>

                                                            <div className="agenda-cita-detalle">
                                                                <div className="cita-top-line">
                                                                    <h4>{cita.nombre_servicio_c}</h4>
                                                                    <span className="cita-precio-tag">${Number(cita.precio_c).toLocaleString()} COP</span>
                                                                </div>
                                                                <p className="cita-cliente-txt">
                                                                    👤 <strong>{nombreCliente}</strong>
                                                                    {cita.cliente?.correo_electronico ? ` · ${cita.cliente.correo_electronico}` : ''}
                                                                </p>
                                                                <p className="cita-direccion-txt">
                                                                    📍 {cita.direccion_atencion} — {cita.barrio_sector}
                                                                    {cita.comuna ? ` (${cita.comuna})` : ''}
                                                                </p>
                                                                {cita.informacion_complementaria && (
                                                                    <p className="cita-extra-txt">Indicaciones: {cita.informacion_complementaria}</p>
                                                                )}
                                                                {cita.observaciones && (
                                                                    <p className="cita-obs-txt">Observaciones: {cita.observaciones}</p>
                                                                )}
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="agenda-grid-layout">
                        {/* SECCIÓN 1: DÍAS Y FRANJAS SEMANALES */}
                        <section className="agenda-card">
                            <h2>1. Horario Semanal Habitual</h2>
                            <p className="section-help">
                                Configura múltiples franjas por día para cubrir jornada partida (ej. mañana y tarde).
                            </p>

                            <form onSubmit={handleAgregarFranja} className="form-franja-row">
                                <div className="agenda-input-group">
                                    <label htmlFor="dia-select">Día</label>
                                    <select
                                        id="dia-select"
                                        value={formFranja.dia}
                                        onChange={(e) => setFormFranja({ ...formFranja, dia: e.target.value })}
                                    >
                                        {DIAS_SEMANA.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="agenda-input-group">
                                    <label htmlFor="hora-inicio">Hora Inicio</label>
                                    <input
                                        id="hora-inicio"
                                        type="time"
                                        value={formFranja.hora_inicio}
                                        onChange={(e) => setFormFranja({ ...formFranja, hora_inicio: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="agenda-input-group">
                                    <label htmlFor="hora-fin">Hora Fin</label>
                                    <input
                                        id="hora-fin"
                                        type="time"
                                        value={formFranja.hora_fin}
                                        onChange={(e) => setFormFranja({ ...formFranja, hora_fin: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-agenda-add" disabled={guardandoFranja}>
                                    {guardandoFranja ? '...' : '+ Agregar Franja'}
                                </button>
                            </form>

                            <div className="semana-listado">
                                {DIAS_SEMANA.map((dia) => {
                                    const franjasDia = disponibilidad.filter(f => f.dia === dia.id);
                                    return (
                                        <div key={dia.id} className="dia-fila">
                                            <div className="dia-nombre">
                                                <strong>{dia.nombre}</strong>
                                            </div>
                                            <div className="dia-franjas">
                                                {franjasDia.length === 0 ? (
                                                    <span className="no-laboral">No atiende</span>
                                                ) : (
                                                    franjasDia.map(f => (
                                                        <span key={f.id_disponibilidad} className="franja-chip">
                                                            {f.hora_inicio.slice(0, 5)} - {f.hora_fin.slice(0, 5)}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEliminarFranja(f.id_disponibilidad)}
                                                                title="Eliminar franja"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SECCIÓN 2: PERIODOS NO DISPONIBLES */}
                        <section className="agenda-card">
                            <h2>2. Fechas de Bloqueo / No Disponibles</h2>
                            <p className="section-help">
                                Bloquea periodos de tiempo en los que no prestarás servicios (vacaciones o permisos).
                            </p>

                            <form onSubmit={handleAgregarBloqueo} className="form-bloqueo-col">
                                <div className="form-row-dates">
                                    <div className="agenda-input-group">
                                        <label htmlFor="fecha-inicio">Desde</label>
                                        <input
                                            id="fecha-inicio"
                                            type="date"
                                            value={formBloqueo.fecha_inicio}
                                            onChange={(e) => setFormBloqueo({ ...formBloqueo, fecha_inicio: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="agenda-input-group">
                                        <label htmlFor="fecha-fin">Hasta</label>
                                        <input
                                            id="fecha-fin"
                                            type="date"
                                            value={formBloqueo.fecha_fin}
                                            onChange={(e) => setFormBloqueo({ ...formBloqueo, fecha_fin: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-agenda-add" disabled={guardandoBloqueo}>
                                    {guardandoBloqueo ? 'Guardando...' : '+ Bloquear Fechas'}
                                </button>
                            </form>

                            <div className="bloqueos-list">
                                {periodos.length === 0 ? (
                                    <p className="no-bloqueos">No tienes periodos bloqueados registrados.</p>
                                ) : (
                                    periodos.map((p) => (
                                        <div key={p.id} className="bloqueo-item">
                                            <div className="bloqueo-info">
                                                <span className="bloqueo-fechas">
                                                    📅 {formatearFecha(p.fecha_inicio)} al {formatearFecha(p.fecha_fin)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-del-bloqueo"
                                                onClick={() => handleEliminarBloqueo(p.id)}
                                                title="Eliminar bloqueo"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                    </>
                )}
            </main>
        </div>
    );
}