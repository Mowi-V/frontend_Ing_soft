import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
import './DashboardProveedor.css';

export default function DashboardProveedor() {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // Estado del servicio seleccionado para edición
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [formEdit, setFormEdit] = useState({
        nombre: '',
        categoria: 'Masajes',
        descripcion: '',
        duracion_minutos: '',
        precio: '',
        estado: 'A'
    });
    const [guardando, setGuardando] = useState(false);

    // 1. Cargar servicios del proveedor autenticado
    const cargarServicios = async () => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        if (!token || rol !== 'P') {
            navigate('/login');
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const res = await fetch('/api/servicios/mis-servicios', {
                headers: { 'x-token': token }
            });

            if (res.status === 401) {
                localStorage.removeItem('x-token');
                navigate('/login');
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setServicios(data.servicios || []);
            } else {
                setError(data.msg || 'Error al obtener tus servicios');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, []);

    // 2. Al hacer clic en una tarjeta, llenar el panel de edición
    const seleccionarParaEditar = (s) => {
        setServicioSeleccionado(s);
        setFormEdit({
            nombre: s.nombre,
            categoria: s.categoria,
            descripcion: s.descripcion,
            duracion_minutos: s.duracion_minutos,
            precio: s.precio,
            estado: s.estado
        });
        setMensajeExito(null);
        setError(null);
    };

    // 3. Manejo de cambios en el formulario de edición
    const handleChangeEdit = (e) => {
        const { name, value } = e.target;
        setFormEdit(prev => ({ ...prev, [name]: value }));
    };

    // 4. Enviar actualización a la API (HU-007)
    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        if (!servicioSeleccionado) return;

        setGuardando(true);
        setError(null);
        setMensajeExito(null);
        const token = localStorage.getItem('x-token');

        try {
            const res = await fetch(`/api/servicios/${servicioSeleccionado.id_servicio}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token
                },
                body: JSON.stringify(formEdit)
            });

            const data = await res.json();

            if (res.ok) {
                setMensajeExito('¡Servicio actualizado correctamente!');
                // Actualizar la lista en el estado local sin recargar la pantalla
                setServicios(prev =>
                    prev.map(serv =>
                        serv.id_servicio === servicioSeleccionado.id_servicio
                            ? { ...serv, ...formEdit, duracion_minutos: parseInt(formEdit.duracion_minutos), precio: parseFloat(formEdit.precio) }
                            : serv
                    )
                );
                // Actualizar la tarjeta seleccionada
                setServicioSeleccionado(prev => ({
                    ...prev,
                    ...formEdit
                }));
            } else {
                setError(data.msg || 'No se pudo actualizar el servicio');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al guardar los cambios');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="prov-dashboard-wrapper">
            <NavbarProveedor />

            <main className="prov-container">
                <header className="prov-header-actions">
                    <div>
                        <h2>Mis Servicios Registrados</h2>
                        <p className="prov-subtexto">
                            Gestiona tu catálogo, actualiza tarifas o cambia la disponibilidad de tus publicaciones.
                        </p>
                    </div>
                    <button 
                        className="btn-crear-servicio"
                        onClick={() => navigate('/crear-servicio')}
                    >
                        + Crear un Servicio
                    </button>
                </header>

                {error && <div className="alerta-error">{error}</div>}
                {mensajeExito && <div className="alerta-exito">{mensajeExito}</div>}

                {cargando ? (
                    <p style={{ color: '#6b7280' }}>Cargando catálogo...</p>
                ) : (
                    <div className="prov-grid-layout">
                        {/* Listado de servicios reales del proveedor */}
                        <section className="prov-services-grid">
                            {servicios.length === 0 ? (
                                <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>
                                    Aún no has registrado ningún servicio. Haz clic en "+ Crear un Servicio" para comenzar.
                                </p>
                            ) : (
                                servicios.map((s) => (
                                    <article 
                                        key={s.id_servicio} 
                                        className={`prov-card ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'card-activa' : ''}`}
                                        onClick={() => seleccionarParaEditar(s)}
                                    >
                                        <div className="prov-card-header">
                                            <span className="prov-pill-cat">{s.categoria}</span>
                                            <span className={`prov-pill-estado ${s.estado === 'A' ? 'activo' : 'inactivo'}`}>
                                                {s.estado === 'A' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="prov-card-title">{s.nombre}</h3>
                                        <p className="prov-card-desc">{s.descripcion}</p>
                                        
                                        <div className="prov-card-meta">
                                            <span>⏱ {s.duracion_minutos} min</span>
                                            <span className="prov-card-precio">${Number(s.precio).toLocaleString()}</span>
                                        </div>
                                        <span className="prov-card-hint">Haz clic para editar</span>
                                    </article>
                                ))
                            )}
                        </section>

                        {/* Panel lateral de edición funcional */}
                        {servicioSeleccionado && (
                            <aside className="prov-edit-panel">
                                <div className="edit-panel-header">
                                    <h3>Editar Servicio</h3>
                                    <button 
                                        className="btn-cerrar-panel" 
                                        onClick={() => setServicioSeleccionado(null)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form className="edit-form-mock" onSubmit={handleGuardarCambios}>
                                    <div className="edit-field">
                                        <label>Nombre del Servicio *</label>
                                        <input 
                                            type="text" 
                                            name="nombre"
                                            value={formEdit.nombre} 
                                            onChange={handleChangeEdit}
                                            required 
                                        />
                                    </div>

                                    <div className="edit-field">
                                        <label>Categoría *</label>
                                        <select 
                                            name="categoria"
                                            value={formEdit.categoria} 
                                            onChange={handleChangeEdit}
                                            required
                                        >
                                            <option value="Estética">Estética</option>
                                            <option value="Bienestar">Bienestar</option>
                                            <option value="Masajes">Masajes</option>
                                        </select>
                                    </div>

                                    <div className="edit-field">
                                        <label>Duración (minutos) *</label>
                                        <input 
                                            type="number" 
                                            name="duracion_minutos"
                                            value={formEdit.duracion_minutos} 
                                            onChange={handleChangeEdit}
                                            min="1"
                                            required 
                                        />
                                    </div>

                                    <div className="edit-field">
                                        <label>Precio ($ COP) *</label>
                                        <input 
                                            type="number" 
                                            name="precio"
                                            value={formEdit.precio} 
                                            onChange={handleChangeEdit}
                                            min="0"
                                            step="1000"
                                            required 
                                        />
                                    </div>

                                    <div className="edit-field">
                                        <label>Estado de Publicación</label>
                                        <select 
                                            name="estado"
                                            value={formEdit.estado} 
                                            onChange={handleChangeEdit}
                                        >
                                            <option value="A">Activo (Visible para clientes)</option>
                                            <option value="I">Inactivo (Oculto)</option>
                                        </select>
                                    </div>

                                    <div className="edit-field">
                                        <label>Descripción *</label>
                                        <textarea 
                                            rows="3" 
                                            name="descripcion"
                                            value={formEdit.descripcion} 
                                            onChange={handleChangeEdit}
                                            required 
                                        />
                                    </div>

                                    <div className="edit-actions">
                                        <button 
                                            type="submit" 
                                            className="btn-guardar" 
                                            style={{ width: '100%' }}
                                            disabled={guardando}
                                        >
                                            {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
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