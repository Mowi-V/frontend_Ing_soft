import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { serviciosService } from '../services/servicios.service';
import './DashboardCliente.css';

export default function DashboardCliente() {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);

    const categorias = ['Todos', 'Estética', 'Bienestar', 'Masajes'];

    useEffect(() => {
        const cargarCatalogo = async () => {
            setCargando(true);
            setError(null);
            try {
                const data = await serviciosService.listarCatalogo(categoriaSeleccionada);
                setServicios(data.servicios || []);
            } catch (err) {
                setError(err.message || 'Error al conectar con el servidor.');
            } finally {
                setCargando(false);
            }
        };

        cargarCatalogo();
    }, [categoriaSeleccionada]);

    const serviciosFiltrados = servicios.filter(s => {
        const query = busqueda.toLowerCase().trim();
        if (!query) return true;

        const coincideNombre = s.nombre?.toLowerCase().includes(query);
        const coincideDesc = s.descripcion?.toLowerCase().includes(query);
        const nombreProv = s.Proveedor?.Usuario 
            ? `${s.Proveedor.Usuario.nombre} ${s.Proveedor.Usuario.apellido || ''}`.toLowerCase()
            : (s.Proveedor?.nombre || '').toLowerCase();

        return coincideNombre || coincideDesc || nombreProv.includes(query);
    });

    return (
        <div className="dashboard-cliente-wrapper">
            <Navbar />

            <main className="dash-container">
                {/* Bloque Central Superior: Buscador y Filtros */}
                <section className="dash-search-filter-block">
                    <input
                        type="text"
                        className="dash-search-input"
                        placeholder="Buscar por servicio, profesional o sector..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                    <div className="dash-filtros">
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                className={`dash-pill ${categoriaSeleccionada === cat ? 'active' : ''}`}
                                onClick={() => setCategoriaSeleccionada(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="dash-section-header">
                    <h1 className="dash-section-title">Servicios Disponibles</h1>
                    <p className="dash-section-count">
                        {cargando ? 'Cargando catálogo...' : `${serviciosFiltrados.length} servicios encontrados`}
                    </p>
                </div>

                {error && <div className="dash-alert-error">{error}</div>}

                <section className="dash-cards-grid">
                    {!cargando && serviciosFiltrados.length === 0 && (
                        <p className="dash-empty-message">
                            No se encontraron servicios disponibles para esta búsqueda.
                        </p>
                    )}

                    {serviciosFiltrados.map((s) => {
                        const miniatura = s.recursos?.find(r => r.es_miniatura === 1 && r.tipo === 'F') 
                                       || s.recursos?.find(r => r.tipo === 'F');

                        // Extracción tolerante de la llave foránea
                        const idProveedor = s.id_proveedor || s.Proveedor?.id_proveedor || s.Proveedor?.Usuario?.id_usuario;

                        const nombreProveedor = s.Proveedor?.Usuario 
                            ? `${s.Proveedor.Usuario.nombre} ${s.Proveedor.Usuario.apellido || ''}`.trim()
                            : (s.Proveedor?.nombre || 'Profesional independiente');

                        const zonaPrincipal = s.Proveedor?.ZonaAtencions?.[0]?.Barrio?.nombre 
                                           || s.Proveedor?.ZonaAtencions?.[0]?.Ciudad?.nombre 
                                           || 'Santiago de Cali';

                        return (
                            <article key={s.id_servicio} className="dash-card">
                                {/* Clic en Imagen -> Detalle del Servicio */}
                                <div 
                                    className="dash-card-image-box" 
                                    onClick={() => navigate(`/servicio/${s.id_servicio}`)}
                                    style={{ cursor: 'pointer' }}
                                    title="Ver detalle del servicio"
                                >
                                    {miniatura?.url_archivo ? (
                                        <img 
                                            src={miniatura.url_archivo} 
                                            alt={s.nombre} 
                                            className="dash-card-img"
                                        />
                                    ) : (
                                        <div className="dash-card-placeholder">
                                            <div className="dash-placeholder-oval"></div>
                                            <span className="dash-placeholder-text">[Sin Imagen]</span>
                                        </div>
                                    )}
                                </div>

                                <div className="dash-card-body">
                                    {/* Clic en Título -> Detalle del Servicio */}
                                    <h3 
                                        className="dash-card-title"
                                        onClick={() => navigate(`/servicio/${s.id_servicio}`)}
                                        style={{ cursor: 'pointer' }}
                                        title="Ver detalle del servicio"
                                    >
                                        {s.nombre}
                                    </h3>
                                    
                                    {/* Clic en Nombre -> Detalle del Proveedor */}
                                    <p 
                                        className="dash-card-provider"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (idProveedor) navigate(`/proveedor/${idProveedor}`);
                                        }}
                                        style={{ cursor: idProveedor ? 'pointer' : 'default', textDecoration: idProveedor ? 'underline' : 'none' }}
                                        title="Ver perfil del profesional"
                                    >
                                        👤 {nombreProveedor}
                                    </p>

                                    <p className="dash-card-desc">{s.descripcion || 'Sin descripción'}</p>

                                    <div className="dash-card-meta-row">
                                        <span className="dash-card-price">
                                            ${Number(s.precio).toLocaleString()}
                                        </span>
                                        <span className="dash-card-duration">
                                            ⏱ {s.duracion_minutos} min
                                        </span>
                                    </div>

                                    <div className="dash-card-tags">
                                        <span className="dash-tag">
                                            {s.categoria ? s.categoria.toUpperCase() : 'GENERAL'}
                                        </span>
                                        <span className="dash-tag">
                                            {zonaPrincipal.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Botones de Navegación Explícitos */}
                                    <div className="dash-card-actions">
                                        <button
                                            type="button"
                                            className="btn-card-detalle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/servicio/${s.id_servicio}`);
                                            }}
                                        >
                                            Ver y Agendar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-card-prov"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (idProveedor) navigate(`/proveedor/${idProveedor}`);
                                            }}
                                            disabled={!idProveedor}
                                        >
                                            Ver Proveedor
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </main>
        </div>
    );
}