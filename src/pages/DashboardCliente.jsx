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

    // Filtro reactivo en tiempo real por nombre, descripción o profesional
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

                {/* Cabecera del Listado */}
                <div className="dash-section-header">
                    <h1 className="dash-section-title">Servicios Disponibles</h1>
                    <p className="dash-section-count">
                        {cargando ? 'Cargando catálogo...' : `${serviciosFiltrados.length} servicios encontrados`}
                    </p>
                </div>

                {error && <div className="dash-alert-error">{error}</div>}

                {/* Grilla de Tarjetas (3 Columnas) */}
                <section className="dash-cards-grid">
                    {!cargando && serviciosFiltrados.length === 0 && (
                        <p className="dash-empty-message">
                            No se encontraron servicios disponibles para esta búsqueda.
                        </p>
                    )}

                    {serviciosFiltrados.map((s) => {
                        const miniatura = s.recursos?.find(r => r.es_miniatura === 1 && r.tipo === 'F') 
                                       || s.recursos?.find(r => r.tipo === 'F');

                        const nombreProveedor = s.Proveedor?.Usuario 
                            ? `${s.Proveedor.Usuario.nombre} ${s.Proveedor.Usuario.apellido || ''}`.trim()
                            : (s.Proveedor?.nombre || s.nombre_proveedor || 'proveedor');

                        const zonaPrincipal = s.Proveedor?.ZonaAtencions?.[0]?.Ciudad?.nombre 
                                           || s.ciudad 
                                           || 'SANTIAGO DE CALI';

                        return (
                            <article key={s.id_servicio} className="dash-card">
                                {/* Cabecera de la tarjeta: Imagen o Placeholder */}
                                <div className="dash-card-image-box">
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

                                {/* Cuerpo de la tarjeta */}
                                <div className="dash-card-body">
                                    <h3 className="dash-card-title">{s.nombre}</h3>
                                    
                                    <p 
                                        className="dash-card-provider"
                                        onClick={() => s.id_proveedor && navigate(`/proveedor/${s.id_proveedor}`)}
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
                                </div>
                            </article>
                        );
                    })}
                </section>
            </main>
        </div>
    );
}