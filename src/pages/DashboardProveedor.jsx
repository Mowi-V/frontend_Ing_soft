import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
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

            // Sincronización en estado local sin recarga de pantalla
            setServicios(prev =>
                prev.map(s => (s.id_servicio === servicioSeleccionado.id_servicio ? respuesta.servicio : s))
            );
            setServicioSeleccionado(respuesta.servicio);
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
                prev.map(s => (s.id_servicio === servicio.id_servicio ? respuesta.servicio : s))
            );

            if (servicioSeleccionado?.id_servicio === servicio.id_servicio) {
                setServicioSeleccionado(respuesta.servicio);
                setFormEdit(prev => ({ ...prev, estado: nuevoEstado }));
            }
        } catch (err) {
            setError(err.message || 'Error al modificar el estado del servicio.');
        } finally {
            setConmutandoEstado(false);
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
                            Gestiona tu catálogo, actualiza tarifas o cambia la disponibilidad de tus publicaciones.
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

                {mensaje && <div className="prov-alert-success">{mensaje}</div>}
                {error && <div className="prov-alert-error">{error}</div>}

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
                                servicios.map((s) => (
                                    <article 
                                        key={s.id_servicio} 
                                        className={`prov-service-card ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'card-seleccionada' : ''}`}
                                        onClick={() => seleccionarParaEditar(s)}
                                    >
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

                                        <div className="prov-card-footer">
                                            <div className="prov-card-duration">
                                                <span className="prov-clock-icon">⏱</span> {s.duracion_minutos} min
                                            </div>
                                            <div className="prov-card-price-group">
                                                <span className="prov-card-price">
                                                    ${Number(s.precio).toLocaleString()}
                                                </span>
                                                <span className="prov-card-edit-hint">Haz clic para editar</span>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </section>

                        {servicioSeleccionado && (
                            <aside className="prov-edit-drawer">
                                <div className="drawer-header">
                                    <h3>Editar Servicio</h3>
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
                                            rows="3" 
                                            value={formEdit.descripcion} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="drawer-buttons">
                                        <button 
                                            type="submit" 
                                            className="btn-drawer-save"
                                            disabled={guardando}
                                        >
                                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-drawer-cancel"
                                            onClick={() => setServicioSeleccionado(null)}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </form>
                            </aside>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}