import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './DashboardCliente.css';

export default function DashboardCliente() {
    const navigate = useNavigate();

    const [servicios, setServicios] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);

    const categorias = ['Todos', 'Estética', 'Bienestar', 'Masajes'];

    // 1. Control de acceso por rol Cliente (RF-06)
    useEffect(() => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        if (!token || rol !== 'C') {
            navigate('/login');
        }
    }, [navigate]);

    // 2. Consulta de Servicios y Proveedores (HU-009)
    const cargarDatos = async (cat = 'Todos') => {
        setCargando(true);
        setError(null);
        try {
            const urlServicios = cat === 'Todos' ? '/api/servicios' : `/api/servicios?categoria=${encodeURIComponent(cat)}`;
            
            const [resServ, resProv] = await Promise.all([
                fetch(urlServicios),
                fetch('/api/proveedores')
            ]);

            const dataServ = await resServ.json();
            const dataProv = await resProv.json();

            if (resServ.ok) setServicios(dataServ.servicios || []);
            if (resProv.ok) setProveedores(dataProv.proveedores || []);
        } catch (err) {
            console.error('Error al conectar con la API:', err);
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos(categoriaSeleccionada);
    }, [categoriaSeleccionada]);

    // Filtro reactivo para Servicios (HU-009 Criterios 2 y 3)
    const serviciosFiltrados = servicios.filter(s => {
        const query = busqueda.toLowerCase();
        const coincideNombre = s.nombre.toLowerCase().includes(query);
        const coincideDesc = s.descripcion?.toLowerCase().includes(query);
        const nombreProv = s.Proveedor?.Usuario ? `${s.Proveedor.Usuario.nombre} ${s.Proveedor.Usuario.apellido}`.toLowerCase() : '';
        return coincideNombre || coincideDesc || nombreProv;
    });

    // Filtro reactivo para Proveedores (HU-009 Criterio 1)
    const proveedoresFiltrados = proveedores.filter(p => {
        const query = busqueda.toLowerCase();
        const coincideNombre = p.nombre.toLowerCase().includes(query);
        const coincideDesc = p.descripcion_perfil?.toLowerCase().includes(query);
        const coincideZona = p.zonas?.some(z => 
            z.ciudad?.toLowerCase().includes(query) || z.barrio?.toLowerCase().includes(query)
        );
        return coincideNombre || coincideDesc || coincideZona;
    });

    return (
        <div className="dashboard-cliente-wrapper">
            <Navbar />

            <main className="dash-container">
                {/* Buscador reactivo integrado */}
                <div style={{ marginBottom: '20px', maxWidth: '500px' }}>
                    <input
                        type="text"
                        className="dash-search-input"
                        placeholder="Buscar por servicio, profesional o sector..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Filtros de Categorías */}
                <section className="dash-filtros">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`dash-pill ${categoriaSeleccionada === cat ? 'active' : ''}`}
                            onClick={() => setCategoriaSeleccionada(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </section>

                {error && <div className="alerta-error">{error}</div>}

                {/* --- SECCIÓN 1: CATÁLOGO DE SERVICIOS (HU-009) --- */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px' }}>
                        Servicios Disponibles
                    </h2>
                    <p className="dash-conteo">
                        {cargando ? 'Cargando servicios...' : `${serviciosFiltrados.length} servicios encontrados`}
                    </p>

                    <div className="dash-cards-grid">
                        {!cargando && serviciosFiltrados.length === 0 && (
                            <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>
                                No se encontraron servicios que coincidan con la búsqueda.
                            </p>
                        )}

                        {serviciosFiltrados.map((s) => {
                            const miniatura = s.recursos?.find(r => r.es_miniatura === 1 && r.tipo === 'F') 
                                           || s.recursos?.find(r => r.tipo === 'F');

                            const nombreProveedor = s.Proveedor?.Usuario 
                                ? `${s.Proveedor.Usuario.nombre} ${s.Proveedor.Usuario.apellido}` 
                                : 'Proveedor';

                            const zonaPrincipal = s.Proveedor?.ZonaAtencions?.[0]?.Ciudad?.nombre || 'Cobertura general';

                            return (
                                <article key={s.id_servicio} className="dash-card">
                                    <div className="dash-card-placeholder">
                                        {miniatura?.url_archivo ? (
                                            <img 
                                                src={miniatura.url_archivo} 
                                                alt={s.nombre} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <>
                                                <div className="dash-placeholder-oval"></div>
                                                <span className="dash-placeholder-text">[Sin Imagen]</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="dash-card-body">
                                        <h3 className="dash-card-title">{s.nombre}</h3>
                                        <p 
                                            style={{ fontSize: '0.82rem', color: '#2563eb', margin: '0 0 6px 0', cursor: 'pointer', fontWeight: '600' }}
                                            onClick={() => navigate(`/proveedor/${s.id_proveedor}`)}
                                        >
                                            👤 {nombreProveedor}
                                        </p>
                                        <p className="dash-card-desc">{s.descripcion}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#111827' }}>
                                                ${Number(s.precio).toLocaleString()}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                ⏱ {s.duracion_minutos} min
                                            </span>
                                        </div>

                                        <div className="dash-card-tags">
                                            <span className="dash-tag">{s.categoria}</span>
                                            <span className="dash-tag">{zonaPrincipal}</span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* --- SECCIÓN 2: PROVEEDORES QUE CUMPLEN CON LA BÚSQUEDA (HU-009 / HU-010) --- */}
                <section>
                    <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '6px' }}>
                        Profesionales y Proveedores
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px' }}>
                        {cargando ? 'Cargando proveedores...' : `${proveedoresFiltrados.length} profesionales disponibles`}
                    </p>

                    <div className="proveedores-grid-layout">
                        {!cargando && proveedoresFiltrados.length === 0 && (
                            <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>
                                No se encontraron proveedores que coincidan con el criterio proporcionado.
                            </p>
                        )}

                        {proveedoresFiltrados.map((p) => (
                            <article key={p.id_proveedor} className="proveedor-card-resumen">
                                <div className="prov-card-header-resumen">
                                    <div className="prov-avatar-resumen"></div>
                                    <div>
                                        <h3 className="prov-nombre-resumen">{p.nombre}</h3>
                                        <span className="prov-badge-cobertura">
                                            {p.zonas?.length > 0 ? `${p.zonas.length} zonas de cobertura` : 'Sin zonas registradas'}
                                        </span>
                                    </div>
                                </div>

                                <p className="prov-desc-resumen">{p.descripcion_perfil}</p>

                                {p.zonas?.length > 0 && (
                                    <div className="prov-zonas-pills">
                                        {p.zonas.slice(0, 3).map(z => (
                                            <span key={z.id_zona} className="prov-zona-tag">
                                                📍 {z.barrio || z.ciudad}
                                            </span>
                                        ))}
                                        {p.zonas.length > 3 && (
                                            <span className="prov-zona-tag">+{p.zonas.length - 3} más</span>
                                        )}
                                    </div>
                                )}

                                <button 
                                    type="button" 
                                    className="btn-ver-proveedor"
                                    onClick={() => navigate(`/proveedor/${p.id_proveedor}`)}
                                >
                                    Ver Perfil y Catálogo →
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}