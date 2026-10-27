import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import { serviciosService } from '../services/servicios.service';
import { clientesService } from '../services/clientes.service';
import { solicitudesService } from '../services/solicitudes.service';
import './DetalleServicio.css';

export default function DetalleServicio() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

    // Formulario de reserva
    const [formReserva, setFormReserva] = useState({
        fecha_hora_solicitada: '',
        direccion_atencion: '',
        barrio_sector: '',
        informacion_complementaria: '',
        observaciones: ''
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setError(null);
            try {
                // Cargar catálogo para encontrar el servicio
                const [dataCatalogo, dataCliente] = await Promise.all([
                    serviciosService.listarCatalogo(),
                    clientesService.obtenerPerfil().catch(() => null)
                ]);

                const encontrado = (dataCatalogo.servicios || []).find(
                    s => String(s.id_servicio) === String(id)
                );

                if (!encontrado) {
                    setError('El servicio solicitado no fue encontrado en el catálogo');
                    return;
                }

                setServicio(encontrado);

                // Configurar foto principal
                const portada = (encontrado.recursos || []).find(r => r.es_miniatura === 1) || (encontrado.recursos || [])[0];
                if (portada) setFotoSeleccionada(portada.url_archivo);

                // Precargar dirección del cliente si existe
                if (dataCliente) {
                    const perfil = dataCliente.perfil || dataCliente.cliente || dataCliente;
                    setFormReserva(prev => ({
                        ...prev,
                        direccion_atencion: perfil.direccion || '',
                        barrio_sector: perfil.barrio || perfil.Barrio?.nombre || '',
                        informacion_complementaria: perfil.informacion_complementaria || ''
                    }));
                }
            } catch (err) {
                setError(err.message || 'Error al cargar los datos del servicio');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormReserva(prev => ({ ...prev, [name]: value }));
    };

    const handleCrearSolicitud = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError(null);
        setMensaje(null);

        const payload = {
            id_servicio: parseInt(id, 10),
            fecha_hora_solicitada: formReserva.fecha_hora_solicitada,
            direccion_atencion: formReserva.direccion_atencion.trim(),
            barrio_sector: formReserva.barrio_sector.trim(),
            informacion_complementaria: formReserva.informacion_complementaria?.trim() || null,
            observaciones: formReserva.observaciones?.trim() || null
        };

        try {
            await solicitudesService.crearSolicitud(payload);
            setMensaje('¡Solicitud creada exitosamente! El proveedor revisará tu horario.');
            setFormReserva(prev => ({ ...prev, observaciones: '' }));
        } catch (err) {
            setError(err.message || 'Error al registrar la solicitud');
        } finally {
            setEnviando(false);
        }
    };

    // Calcular fecha mínima permitida (mañana a primera hora o en 2 horas)
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
                        {/* COLUMNA IZQUIERDA: INFORMACIÓN Y MULTIMEDIA */}
                        <section className="detalle-info-card">
                            <span className="detalle-badge-cat">{servicio.categoria}</span>
                            <h1 className="detalle-titulo">{servicio.nombre}</h1>

                            {/* Foto principal */}
                            {fotoSeleccionada && (
                                <div className="detalle-foto-hero">
                                    <img src={`${fotoSeleccionada}?tr=w-700,h-380,fo-auto`} alt={servicio.nombre} />
                                </div>
                            )}

                            {/* Miniaturas de referencia */}
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

                            {/* Insumos requeridos */}
                            {(servicio.insumos || []).length > 0 && (
                                <div className="detalle-insumos-bloque">
                                    <h3>Insumos y Equipos que Lleva el Profesional</h3>
                                    <div className="insumos-chips-list">
                                        {(servicio.insumos || []).map((ins) => (
                                            <span key={ins.id_insumo} className="insumo-chip">
                                                ✓ {ins.nombre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Datos del Proveedor */}
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
                        </section>

                        {/* COLUMNA DERECHA: TARJETA DE AGENDAMIENTO */}
                        <aside className="detalle-reserva-card">
                            <div className="reserva-price-header">
                                <span className="reserva-label">Precio del servicio</span>
                                <span className="reserva-monto">${Number(servicio.precio).toLocaleString()} COP</span>
                                <span className="reserva-duracion">⏱ Duración: {servicio.duracion_minutos} minutos</span>
                            </div>

                            <form onSubmit={handleCrearSolicitud} className="form-solicitud">
                                <h3>Agendar Cita a Domicilio</h3>

                                <div className="form-solic-group">
                                    <label htmlFor="fecha_hora_solicitada">Fecha y Hora de Llegada *</label>
                                    <input
                                        id="fecha_hora_solicitada"
                                        type="datetime-local"
                                        name="fecha_hora_solicitada"
                                        value={formReserva.fecha_hora_solicitada}
                                        onChange={handleInputChange}
                                        min={fechaMinima}
                                        required
                                    />
                                </div>

                                <div className="form-solic-group">
                                    <label htmlFor="barrio_sector">Barrio o Sector *</label>
                                    <input
                                        id="barrio_sector"
                                        type="text"
                                        name="barrio_sector"
                                        value={formReserva.barrio_sector}
                                        onChange={handleInputChange}
                                        placeholder="Ej. El Ingenio"
                                        required
                                    />
                                </div>

                                <div className="form-solic-group">
                                    <label htmlFor="direccion_atencion">Dirección del Domicilio *</label>
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
                                    <label htmlFor="informacion_complementaria">Detalles del Domicilio (Opcional)</label>
                                    <input
                                        id="informacion_complementaria"
                                        type="text"
                                        name="informacion_complementaria"
                                        value={formReserva.informacion_complementaria}
                                        onChange={handleInputChange}
                                        placeholder="Apto, torre, conjunto o indicaciones"
                                    />
                                </div>

                                <div className="form-solic-group">
                                    <label htmlFor="observaciones">Observaciones / Preferencias (Opcional)</label>
                                    <textarea
                                        id="observaciones"
                                        name="observaciones"
                                        rows="2"
                                        value={formReserva.observaciones}
                                        onChange={handleInputChange}
                                        placeholder="Detalles sobre el espacio o requerimientos especiales"
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
                                    No se realiza ningún cargo en este paso. El servicio se pagará directamente con el profesional.
                                </p>
                            </form>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}