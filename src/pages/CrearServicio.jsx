import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavbarProveedor from '../components/NavbarProveedor';
import './CrearServicio.css';

export default function CrearServicio() {
    const navigate = useNavigate();
    // Campos principales del servicio (HU-006)
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [duracion, setDuracion] = useState('');
    const [precio, setPrecio] = useState('');
    const [estado, setEstado] = useState('A');

    // Multimedia (HU-008: Fotos y Videos)
    const [imagenes, setImagenes] = useState([]);
    const [videos, setVideos] = useState([]);
    const [miniaturaIndex, setMiniaturaIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);

    // Validación de sesión y rol
    useEffect(() => {
        const token = localStorage.getItem('x-token');
        const rol = localStorage.getItem('usuario_rol');

        if (!token || rol !== 'P') {
            window.location.href = '/login';
        }
    }, []);

    // Carga de imágenes locales y generación de previews
    const handleImagenesChange = (e) => {
        const files = Array.from(e.target.files);
        const nuevasImagenes = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        setImagenes(prev => [...prev, ...nuevasImagenes]);
    };

    // Carga de videos locales y generación de previews
    const handleVideosChange = (e) => {
        const files = Array.from(e.target.files);
        const nuevosVideos = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        setVideos(prev => [...prev, ...nuevosVideos]);
    };

    const eliminarImagen = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
        if (miniaturaIndex === index) setMiniaturaIndex(0);
    };

    const eliminarVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);
        setLoading(true);

        const token = localStorage.getItem('x-token');

        // Paso 1: Registrar el Servicio principal (HU-006)
        const payloadServicio = {
            nombre,
            categoria,
            descripcion,
            duracion_minutos: parseInt(duracion, 10),
            precio: parseFloat(precio),
            estado
        };

        try {
            const res = await fetch('/api/servicios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token
                },
                body: JSON.stringify(payloadServicio)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.msg || 'Error al crear el servicio');
                setLoading(false);
                return;
            }

            const idNuevoServicio = data.servicio.id_servicio;

            // Paso 2: Subir recursos multimedia si existen (HU-008)
            if (imagenes.length > 0 || videos.length > 0) {
                for (let i = 0; i < imagenes.length; i++) {
                    const formData = new FormData();
                    formData.append('recurso', imagenes[i].file);
                    formData.append('es_miniatura', i === miniaturaIndex ? 'true' : 'false');

                    await fetch(`/api/servicios/${idNuevoServicio}/recursos`, {
                        method: 'POST',
                        headers: { 'x-token': token },
                        body: formData
                    });
                }

                for (let i = 0; i < videos.length; i++) {
                    const formData = new FormData();
                    formData.append('recurso', videos[i].file);
                    formData.append('es_miniatura', 'false');

                    await fetch(`/api/servicios/${idNuevoServicio}/recursos`, {
                        method: 'POST',
                        headers: { 'x-token': token },
                        body: formData
                    });
                }
            }

            setExito('¡Servicio y multimedia registrados exitosamente en tu catálogo!');
            setTimeout(() => {
                navigate('/dashboard-proveedor'); // 🌟 Navegación sin recarga
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('Error de conexión al guardar el servicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crear-servicio-wrapper">
            <NavbarProveedor />

            <main className="crear-servicio-container">
                <header className="crear-servicio-header">
                    <h2>Registrar un Nuevo Servicio</h2>
                    <p>Publica tu oferta de atención a domicilio con detalles claros y referencias visuales.</p>
                </header>

                {error && <div className="alerta-error">{error}</div>}
                {exito && <div className="alerta-exito">{exito}</div>}

                <form className="crear-servicio-card" onSubmit={handleSubmit}>
                    {/* SECCIÓN 1: DATOS BÁSICOS (HU-006) */}
                    <div className="form-seccion">
                        <h3>1. Información Principal del Catálogo</h3>
                        
                        <div className="form-grupo">
                            <label>Nombre del Servicio *</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Ej: Masaje Relajante con Aromaterapia" 
                                required 
                            />
                        </div>

                        <div className="form-fila">
                            <div className="form-grupo">
                                <label>Categoría Permitida *</label>
                                <select 
                                    value={categoria} 
                                    onChange={(e) => setCategoria(e.target.value)} 
                                    required
                                >
                                    <option value="">Seleccione una categoría...</option>
                                    <option value="Estética">Estética</option>
                                    <option value="Bienestar">Bienestar</option>
                                    <option value="Masajes">Masajes</option>
                                </select>
                            </div>

                            <div className="form-grupo">
                                <label>Duración Estimada (minutos) *</label>
                                <input 
                                    type="number" 
                                    value={duracion} 
                                    onChange={(e) => setDuracion(e.target.value)} 
                                    min="1" 
                                    placeholder="Ej: 60" 
                                    required 
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Precio ($ COP) *</label>
                                <input 
                                    type="number" 
                                    value={precio} 
                                    onChange={(e) => setPrecio(e.target.value)} 
                                    min="0" 
                                    step="1000" 
                                    placeholder="Ej: 80000" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Descripción Detallada *</label>
                            <textarea 
                                rows="3" 
                                value={descripcion} 
                                onChange={(e) => setDescripcion(e.target.value)} 
                                placeholder="Describe las etapas de la sesión, beneficios y consideraciones del espacio..." 
                                required 
                            />
                        </div>

                        <div className="form-grupo">
                            <label>Estado Inicial</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                                <option value="A">Activo (Visible de inmediato para clientes)</option>
                                <option value="I">Inactivo (Guardado como borrador oculto)</option>
                            </select>
                        </div>
                    </div>

                    {/* SECCIÓN 2: MULTIMEDIA (HU-008: FOTOS Y VIDEOS) */}
                    <div className="form-seccion">
                        <h3>2. Contenido Multimedia de Referencia</h3>
                        <p className="seccion-desc">
                            Asocia fotografías y videos de demostración para brindar a los clientes una referencia de tu trabajo.
                        </p>

                        {/* Bloque de Fotografías */}
                        <div className="media-upload-bloque">
                            <div className="upload-header">
                                <label className="upload-label">📸 Fotografías (JPG, PNG, WEBP)</label>
                                <label className="btn-file-custom">
                                    + Agregar Fotos
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleImagenesChange} 
                                    />
                                </label>
                            </div>

                            <div className="previews-grid">
                                {imagenes.length === 0 ? (
                                    <div className="preview-empty">No has añadido fotografías aún.</div>
                                ) : (
                                    imagenes.map((img, idx) => (
                                        <div key={idx} className={`preview-item ${miniaturaIndex === idx ? 'miniatura-seleccionada' : ''}`}>
                                            <img src={img.previewUrl} alt={`preview-${idx}`} />
                                            <div className="preview-controls">
                                                <button 
                                                    type="button" 
                                                    className="btn-select-mini"
                                                    onClick={() => setMiniaturaIndex(idx)}
                                                >
                                                    {miniaturaIndex === idx ? '★ Portada' : 'Hacer Portada'}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-delete-item"
                                                    onClick={() => eliminarImagen(idx)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Bloque de Videos */}
                        <div className="media-upload-bloque">
                            <div className="upload-header">
                                <label className="upload-label">🎥 Videos de Referencia (MP4, WEBM)</label>
                                <label className="btn-file-custom">
                                    + Agregar Video
                                    <input 
                                        type="file" 
                                        accept="video/*" 
                                        multiple 
                                        onChange={handleVideosChange} 
                                    />
                                </label>
                            </div>

                            <div className="previews-grid">
                                {videos.length === 0 ? (
                                    <div className="preview-empty">No has añadido videos aún.</div>
                                ) : (
                                    videos.map((vid, idx) => (
                                        <div key={idx} className="preview-item video-item">
                                            <video src={vid.previewUrl} controls />
                                            <div className="preview-controls">
                                                <button 
                                                    type="button" 
                                                    className="btn-delete-item"
                                                    onClick={() => eliminarVideo(idx)}
                                                >
                                                    ✕ Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-submit-row">
                        <Link to="/dashboard-proveedor" className="btn-cancelar">
                            Cancelar
                        </Link>
                        <button type="submit" className="btn-guardar-servicio" disabled={loading}>
                            {loading ? 'Guardando...' : 'Publicar Servicio'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}