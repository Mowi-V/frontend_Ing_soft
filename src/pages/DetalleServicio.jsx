import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import { serviciosService } from '../services/servicios.service';
import { clientesService } from '../services/clientes.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import { disponibilidadService } from '../services/disponibilidad.service';
import { solicitudesService } from '../services/solicitudes.service';
import './DetalleServicio.css';

const DIAS_SEMANA = [
    { id: 'LU', nombre: 'Lunes' },
    { id: 'MA', nombre: 'Martes' },
    { id: 'MI', nombre: 'Miércoles' },
    { id: 'JU', nombre: 'Jueves' },
    { id: 'VI', nombre: 'Viernes' },
    { id: 'SA', nombre: 'Sábado' },
    { id: 'DO', nombre: 'Domingo' }
];

export default function DetalleServicio() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState(null);
    const [perfilCliente, setPerfilCliente] = useState(null);
    const [comunas, setComunas] = useState([]);
    const [barriosFiltrados, setBarriosFiltrados] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

    // Selector de modo de ubicación: 'perfil' | 'otra'
    const [modoUbicacion, setModoUbicacion] = useState('perfil');

    // Estados de ubicación personalizada
    const [comunaSeleccionada, setComunaSeleccionada] = useState('');
    const [barrioSeleccionado, setBarrioSeleccionado] = useState('');

    // Datos del formulario de reserva
    const [formReserva, setFormReserva] = useState({
        fecha_hora_solicitada: '',
        direccion_atencion: '',
        informacion_complementaria: '',
        observaciones: ''
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setError(null);
            try {
                const [dataCatalogo, dataCliente, dataUbicaciones] = await Promise.all([
                    serviciosService.listarCatalogo(),
                    clientesService.obtenerPerfil().catch(() => null),
                    ubicacionesService.obtenerUbicaciones().catch(() => [])
                ]);

                const encontrado = (dataCatalogo.servicios || []).find(
                    s => String(s.id_servicio) === String(id)
                );

                if (!encontrado) {
                    setError('El servicio solicitado no fue encontrado en el catálogo');
                    return;
                }

                setServicio(encontrado);
                setComunas(dataUbicaciones || []);

                const portada = (encontrado.recursos || []).find(r => r.es_miniatura === 1 && r.tipo === 'F') 
                             || (encontrado.recursos || [])[0];
                if (portada) setFotoSeleccionada(portada.url_archivo);

                // Cargar disponibilidad y bloqueos del proveedor a cargo
                const idProv = encontrado.id_proveedor || encontrado.Proveedor?.id_proveedor;
                if (idProv) {
                    try {
                        const dataDisp = await disponibilidadService.obtenerDisponibilidadProveedor(idProv);
                        setDisponibilidad(dataDisp.disponibilidad || []);
                        setPeriodos(dataDisp.periodos_no_disponibles || []);
                    } catch {
                        setDisponibilidad([]);
                        setPeriodos([]);
                    }
                }

                // Configurar datos del cliente si existen
                if (dataCliente) {
                    const p = dataCliente.perfil || dataCliente.cliente || dataCliente;
                    setPerfilCliente(p);

                    setFormReserva(prev => ({
                        ...prev,
                        direccion_atencion: p.direccion || '',
                        informacion_complementaria: p.informacion_complementaria || ''
                    }));
                } else {
                    setModoUbicacion('otra');
                }
            } catch (err) {
                setError(err.message || 'Error al cargar los datos del servicio');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleCambioModoUbicacion = (modo) => {
        setModoUbicacion(modo);
        setError(null);

        if (modo === 'perfil' && perfilCliente) {
            setFormReserva(prev => ({
                ...prev,
                direccion_atencion: perfilCliente.direccion || '',
                informacion_complementaria: perfilCliente.informacion_complementaria || ''
            }));
            setComunaSeleccionada('');
            setBarrioSeleccionado('');
            setBarriosFiltrados([]);
        } else {
            setFormReserva(prev => ({
                ...prev,
                direccion_atencion: '',
                informacion_complementaria: ''
            }));
        }
    };

    const handleComunaChange = (e) => {
        const idComuna = e.target.value;
        setComunaSeleccionada(idComuna);
        setBarrioSeleccionado('');

        if (!idComuna) {
            setBarriosFiltrados([]);
            return;
        }

        const encontrada = comunas.find(c => String(c.id_comuna) === String(idComuna));
        const listaBarrios = encontrada ? (encontrada.Barrios || encontrada.barrios || []) : [];
        setBarriosFiltrados(listaBarrios);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormReserva(prev => ({ ...prev, [name]: value }));
    };

    const handleCrearSolicitud = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError(null);
        setMensaje(null);

        let barrioFinalId = null;

        if (modoUbicacion === 'perfil') {
            barrioFinalId = perfilCliente?.id_barrio;
            if (!barrioFinalId) {
                setError('Tu perfil no tiene un barrio asociado. Por favor selecciona "Otra ubicación".');
                setEnviando(false);
                return;
            }
        } else {
            if (!barrioSeleccionado) {
                setError('Debes seleccionar una comuna y un barrio de atención.');
                setEnviando(false);
                return;
            }
            barrioFinalId = parseInt(barrioSeleccionado, 10);
        }

        const payload = {
            id_servicio: parseInt(id, 10),
            id_barrio: barrioFinalId,
            fecha_hora_solicitada: formReserva.fecha_hora_solicitada,
            direccion_atencion: formReserva.direccion_atencion.trim(),
            informacion_complementaria: formReserva.informacion_complementaria?.trim() || null,
            observaciones: formReserva.observaciones?.trim() || null
        };

        try {
            await solicitudesService.crearSolicitud(payload);
            setMensaje('¡Solicitud registrada exitosamente bajo estado Pendiente!');
            setFormReserva(prev => ({ ...prev, observaciones: '' }));
        } catch (err) {
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setEnviando(false);
        }
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        return String(fechaStr).slice(0, 10);
    };

    const fechaMinima = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    return (
        <div className="detalle-serv-wrapper">
            <Navbar />

            <main className="detalle-serv-container">
                <Link to="/dashboard-cliente" className="btn-volver-catalogo">
                    ← Volver al catálogo
                </Link>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {cargando ? (
                    <p className="detalle-loading">Cargando detalles del servicio...</p>
                ) : !servicio ? null : (
                    <div className="detalle-serv-layout">
                        {/* COLUMNA IZQUIERDA: INFORMACIÓN, MULTIMEDIA Y HORARIOS */}
                        <section className="detalle-info-card">
                            <span className="detalle-badge-cat">{servicio.categoria}</span>
                            <h1 className="detalle-titulo">{servicio.nombre}</h1>

                            {fotoSeleccionada && (
                                <div className="detalle-foto-hero">
                                    <img src={`${fotoSeleccionada}?tr=w-700,h-380,fo-auto`} alt={servicio.nombre} />
                                </div>
                            )}

                            {(servicio.recursos || []).length > 1 && (
                                <div className="detalle-galeria-strip">
                                    {(servicio.recursos || []).map((r) => (
                                        <button
                                            key={r.id_recurso}
                                            type="button"
                                            className={`thumb-btn ${fotoSeleccionada === r.url_archivo ? 'thumb-activa' : ''}`}
                                            onClick={() => setFotoSeleccionada(r.url_archivo)}
                                        >
                                            <img src={`${r.url_archivo}?tr=w-90,h-65,fo-auto`} alt="preview" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="detalle-descripcion-bloque">
                                <h3>Descripción del Servicio</h3>
                                <p>{servicio.descripcion}</p>
                            </div>

                            {(servicio.insumos || []).length > 0 && (
                                <div className="detalle-insumos-bloque">
                                    <h3>Insumos y Equipos Empleados</h3>
                                    <div className="insumos-chips-list">
                                        {(servicio.insumos || []).map((ins) => (
                                            <span key={ins.id_insumo} className="insumo-chip">
                                                ✓ {ins.nombre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detalle-proveedor-bloque">
                                <h3>Profesional a Domicilio</h3>
                                <p className="prov-nombre-txt">
                                    👤 {servicio.Proveedor?.Usuario?.nombre} {servicio.Proveedor?.Usuario?.apellido}
                                </p>
                                {(servicio.Proveedor?.ZonaAtencions || []).length > 0 && (
                                    <div className="cobertura-txt">
                                        <span className="cobertura-label">Zonas de cobertura habitual:</span>{' '}
                                        {(servicio.Proveedor.ZonaAtencions || [])
                                            .map(z => z.Barrio?.nombre || 'Barrio')
                                            .slice(0, 5)
                                            .join(', ')}
                                        {(servicio.Proveedor.ZonaAtencions || []).length > 5 ? ' y más...' : ''}
                                    </div>
                                )}
                            </div>

                            {/* HORARIOS DE ATENCIÓN SEMANAL Y BLOQUEOS DEL PROFESIONAL */}
                            <div className="detalle-horarios-bloque">
                                <div className="horarios-bloque-header">
                                    <h3>🕒 Horarios de Atención del Profesional</h3>
                                    <p className="horarios-help-txt">
                                        Consulta la disponibilidad semanal para seleccionar un horario válido para tu cita:
                                    </p>
                                </div>

                                <div className="semana-horarios-mini">
                                    {DIAS_SEMANA.map((dia) => {
                                        const franjasDia = disponibilidad.filter(f => f.dia === dia.id);
                                        return (
                                            <div key={dia.id} className="dia-mini-row">
                                                <span className="dia-mini-nombre">{dia.nombre}</span>
                                                <div className="dia-mini-franjas">
                                                    {franjasDia.length === 0 ? (
                                                        <span className="descanso-mini-tag">No atiende</span>
                                                    ) : (
                                                        franjasDia.map(f => (
                                                            <span key={f.id_disponibilidad} className="franja-mini-chip">
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
                                    <div className="bloqueos-mini-box">
                                        <span className="bloqueo-mini-title">🚫 Periodos No Disponibles / Descansos:</span>
                                        <div className="bloqueos-mini-list">
                                            {periodos.map(p => (
                                                <span key={p.id} className="bloqueo-mini-badge">
                                                    {formatearFecha(p.fecha_inicio)} al {formatearFecha(p.fecha_fin)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* COLUMNA DERECHA: PANEL DE AGENDAMIENTO */}
                        <aside className="detalle-reserva-card">
                            <div className="reserva-price-header">
                                <span className="reserva-label">Precio del servicio</span>
                                <span className="reserva-monto">${Number(servicio.precio).toLocaleString()} COP</span>
                                <span className="reserva-duracion">⏱ Duración: {servicio.duracion_minutos} minutos</span>
                            </div>

                            <form onSubmit={handleCrearSolicitud} className="form-solicitud">
                                <h3>Agendar Cita a Domicilio</h3>

                                <div className="form-solic-group">
                                    <label htmlFor="fecha_hora_solicitada">Fecha y Hora de Inicio *</label>
                                    <input
                                        id="fecha_hora_solicitada"
                                        type="datetime-local"
                                        name="fecha_hora_solicitada"
                                        value={formReserva.fecha_hora_solicitada}
                                        onChange={handleInputChange}
                                        min={fechaMinima}
                                        required
                                    />
                                    <span className="input-hint-horario">
                                        Verifica los horarios del profesional a la izquierda para evitar cruces.
                                    </span>
                                </div>

                                {/* SELECTOR DE MODO DE UBICACIÓN */}
                                <div className="form-solic-group">
                                    <label>Lugar de Atención *</label>
                                    <div className="toggle-ubicacion-box">
                                        <button
                                            type="button"
                                            className={`btn-toggle-ubicacion ${modoUbicacion === 'perfil' ? 'activo' : ''}`}
                                            onClick={() => handleCambioModoUbicacion('perfil')}
                                            disabled={!perfilCliente}
                                        >
                                            🏠 Mi dirección registrada
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-toggle-ubicacion ${modoUbicacion === 'otra' ? 'activo' : ''}`}
                                            onClick={() => handleCambioModoUbicacion('otra')}
                                        >
                                            📍 Otra ubicación
                                        </button>
                                    </div>
                                </div>

                                {/* CASO A: DIRECCIÓN DEL PERFIL */}
                                {modoUbicacion === 'perfil' && perfilCliente && (
                                    <div className="ubicacion-preview-box">
                                        <p className="preview-barrio">
                                            <strong>Barrio:</strong> {perfilCliente.barrio || perfilCliente.Barrio?.nombre || 'Barrio registrado'}
                                        </p>
                                        <p className="preview-dir">
                                            <strong>Dirección:</strong> {perfilCliente.direccion || 'Sin dirección registrada'}
                                        </p>
                                        {perfilCliente.informacion_complementaria && (
                                            <p className="preview-info">
                                                <strong>Detalles:</strong> {perfilCliente.informacion_complementaria}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* CASO B: SELECTORES EN CASCADA COMUNA -> BARRIO */}
                                {modoUbicacion === 'otra' && (
                                    <div className="otra-ubicacion-box">
                                        <div className="form-solic-group">
                                            <label htmlFor="comuna_sel">Comuna (Santiago de Cali) *</label>
                                            <select
                                                id="comuna_sel"
                                                value={comunaSeleccionada}
                                                onChange={handleComunaChange}
                                                required
                                            >
                                                <option value="">Seleccione una Comuna...</option>
                                                {comunas.map(c => (
                                                    <option key={c.id_comuna} value={c.id_comuna}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-solic-group">
                                            <label htmlFor="barrio_sel">Barrio *</label>
                                            <select
                                                id="barrio_sel"
                                                value={barrioSeleccionado}
                                                onChange={(e) => setBarrioSeleccionado(e.target.value)}
                                                disabled={!comunaSeleccionada}
                                                required
                                            >
                                                <option value="">
                                                    {!comunaSeleccionada 
                                                        ? 'Primero seleccione una Comuna...' 
                                                        : 'Seleccione un Barrio...'}
                                                </option>
                                                {barriosFiltrados.map(b => (
                                                    <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-solic-group">
                                            <label htmlFor="direccion_atencion">Dirección Exacta *</label>
                                            <input
                                                id="direccion_atencion"
                                                type="text"
                                                name="direccion_atencion"
                                                value={formReserva.direccion_atencion}
                                                onChange={handleInputChange}
                                                placeholder="Ej. Carrera 85 # 14-20"
                                                required
                                            />
                                        </div>

                                        <div className="form-solic-group">
                                            <label htmlFor="informacion_complementaria">Detalles de Llegada (Opcional)</label>
                                            <input
                                                id="informacion_complementaria"
                                                type="text"
                                                name="informacion_complementaria"
                                                value={formReserva.informacion_complementaria}
                                                onChange={handleInputChange}
                                                placeholder="Apto, torre o indicaciones de timbre"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-solic-group">
                                    <label htmlFor="observaciones">Observaciones / Preferencias (Opcional)</label>
                                    <textarea
                                        id="observaciones"
                                        name="observaciones"
                                        rows="2"
                                        value={formReserva.observaciones}
                                        onChange={handleInputChange}
                                        placeholder="Indica condiciones del espacio o requerimientos"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-enviar-solicitud"
                                    disabled={enviando}
                                >
                                    {enviando ? 'Verificando agenda...' : 'Confirmar y Solicitar Cita'}
                                </button>
                                <p className="reserva-disclaimer">
                                    El valor acordado se paga directamente con el profesional.
                                </p>
                            </form>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}