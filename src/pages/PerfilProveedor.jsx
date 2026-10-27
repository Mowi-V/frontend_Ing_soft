import { useEffect, useState } from 'react';
import NavbarProveedor from '../components/NavbarProveedor';
import Alerta from '../components/common/Alerta';
import { proveedoresService } from '../services/proveedores.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import './PerfilProveedor.css';

export default function PerfilProveedor() {
    const [comunas, setComunas] = useState([]);
    const [barriosFiltrados, setBarriosFiltrados] = useState([]);
    const [zonasRegistradas, setZonasRegistradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const [guardandoZona, setGuardandoZona] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [formPerfil, setFormPerfil] = useState({
        nombre: '',
        apellido: '',
        correo_electronico: '',
        descripcion_perfil: ''
    });

    const [comunaSeleccionada, setComunaSeleccionada] = useState('');
    const [barrioSeleccionado, setBarrioSeleccionado] = useState('');

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);
        try {
            const [dataPerfil, dataUbicaciones] = await Promise.all([
                proveedoresService.obtenerMiPerfil(),
                ubicacionesService.obtenerUbicaciones()
            ]);

            setComunas(dataUbicaciones || []);

            const p = dataPerfil?.perfil || dataPerfil?.proveedor || dataPerfil || {};
            setFormPerfil({
                nombre: p.nombre || p.usuario?.nombre || '',
                apellido: p.apellido || p.usuario?.apellido || '',
                correo_electronico: p.correo_electronico || p.usuario?.correo_electronico || '',
                descripcion_perfil: p.descripcion_perfil || ''
            });

            const zonas = p.zonas || p.zonas_atencion || p.ZonaAtencions || [];
            setZonasRegistradas(Array.isArray(zonas) ? zonas : []);
        } catch (err) {
            setError(err.message || 'Error al cargar la información del proveedor.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Corrección: lectura tolerante a Barrios / barrios
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

    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setGuardandoPerfil(true);
        setError(null);
        setMensaje(null);

        try {
            await proveedoresService.actualizarMiPerfil({
                nombre: formPerfil.nombre.trim(),
                apellido: formPerfil.apellido.trim(),
                descripcion_perfil: formPerfil.descripcion_perfil.trim()
            });
            setMensaje('Perfil profesional actualizado correctamente.');
            setModoEdicion(false);
        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setGuardandoPerfil(false);
        }
    };

    const handleAgregarZona = async (e) => {
        e.preventDefault();
        if (!barrioSeleccionado) return;

        setGuardandoZona(true);
        setError(null);
        setMensaje(null);

        try {
            const res = await proveedoresService.agregarZona(parseInt(barrioSeleccionado, 10));
            setMensaje('Zona de atención registrada.');

            const barrioObj = barriosFiltrados.find(b => String(b.id_barrio) === String(barrioSeleccionado));
            const comunaObj = comunas.find(c => String(c.id_comuna) === String(comunaSeleccionada));

            const nuevaZona = {
                ...(res.zona || {}),
                id_zona: res.zona?.id_zona || Date.now(),
                id_barrio: parseInt(barrioSeleccionado, 10),
                Barrio: {
                    id_barrio: parseInt(barrioSeleccionado, 10),
                    nombre: barrioObj?.nombre || 'Barrio',
                    Comuna: {
                        id_comuna: comunaObj?.id_comuna,
                        nombre: comunaObj?.nombre || 'Comuna'
                    }
                }
            };

            setZonasRegistradas(prev => [...prev, nuevaZona]);
            setBarrioSeleccionado('');
        } catch (err) {
            setError(err.message || 'Error al registrar la zona de atención.');
        } finally {
            setGuardandoZona(false);
        }
    };

    const handleEliminarZona = async (idZona) => {
        setError(null);
        setMensaje(null);
        try {
            await proveedoresService.eliminarZona(idZona);
            setZonasRegistradas(prev => prev.filter(z => z.id_zona !== idZona));
            setMensaje('Zona de atención retirada.');
        } catch (err) {
            setError(err.message || 'Error al eliminar la zona.');
        }
    };

    const zonasAgrupadasPorComuna = zonasRegistradas.reduce((acc, z) => {
        const nombreComuna = z.Barrio?.Comuna?.nombre || z.Comuna?.nombre || 'Comuna General';
        if (!acc[nombreComuna]) acc[nombreComuna] = [];
        acc[nombreComuna].push(z);
        return acc;
    }, {});

    return (
        <div className="perfil-prov-wrapper">
            <NavbarProveedor />

            <main className="perfil-prov-container">
                <header className="perfil-header-card">
                    <div className="perfil-avatar-circle">
                        {formPerfil.nombre ? formPerfil.nombre.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="perfil-header-text">
                        <h2 className="perfil-header-title">{formPerfil.nombre} {formPerfil.apellido}</h2>
                        <p className="perfil-header-subtitle">{formPerfil.correo_electronico}</p>
                    </div>
                </header>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {cargando ? (
                    <p className="perfil-prov-cargando">Cargando datos profesionales...</p>
                ) : (
                    <>
                        <div className="perfil-card-bloque">
                            <div className="perfil-top-actions">
                                <span className={`perfil-badge-estado ${modoEdicion ? 'modo-edicion' : 'modo-lectura'}`}>
                                    {modoEdicion ? 'Modo Edición' : 'Campos Bloqueados (Solo Lectura)'}
                                </span>
                                <button
                                    type="button"
                                    className={modoEdicion ? 'btn-cancelar-edicion' : 'btn-actualizar-campos'}
                                    onClick={() => setModoEdicion(!modoEdicion)}
                                >
                                    {modoEdicion ? 'Cancelar' : '✏️ Actualizar datos'}
                                </button>
                            </div>

                            <form className="perfil-prov-form" onSubmit={handleGuardarPerfil}>
                                <div className="perfil-form-row">
                                    <div className="perfil-form-group">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={formPerfil.nombre}
                                            disabled={!modoEdicion}
                                            className={!modoEdicion ? 'input-bloqueado' : ''}
                                            onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="perfil-form-group">
                                        <label htmlFor="apellido">Apellido</label>
                                        <input
                                            id="apellido"
                                            type="text"
                                            value={formPerfil.apellido}
                                            disabled={!modoEdicion}
                                            className={!modoEdicion ? 'input-bloqueado' : ''}
                                            onChange={(e) => setFormPerfil({ ...formPerfil, apellido: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="perfil-form-group">
                                    <label htmlFor="descripcion_perfil">Descripción del Perfil / Experiencia</label>
                                    <textarea
                                        id="descripcion_perfil"
                                        rows="3"
                                        value={formPerfil.descripcion_perfil}
                                        disabled={!modoEdicion}
                                        className={!modoEdicion ? 'input-bloqueado' : ''}
                                        onChange={(e) => setFormPerfil({ ...formPerfil, descripcion_perfil: e.target.value })}
                                        required
                                    />
                                </div>

                                {modoEdicion && (
                                    <div className="perfil-acciones-guardar">
                                        <button type="submit" className="btn-guardar-perfil" disabled={guardandoPerfil}>
                                            {guardandoPerfil ? 'Guardando...' : 'Guardar Información'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="perfil-card-bloque">
                            <div className="zonas-header-box">
                                <h3 className="zonas-titulo-principal">Zonas de Cobertura Domiciliaria</h3>
                                <p className="zonas-subtexto">
                                    Selecciona los barrios de Santiago de Cali donde estás disponible para realizar servicios.
                                </p>
                            </div>

                            <form onSubmit={handleAgregarZona} className="zona-agregar-card">
                                <div className="zona-inputs-grid">
                                    <div className="zona-input-field">
                                        <label htmlFor="comuna_sel">Comuna</label>
                                        <select
                                            id="comuna_sel"
                                            value={comunaSeleccionada}
                                            onChange={handleComunaChange}
                                        >
                                            <option value="">Seleccione una Comuna...</option>
                                            {comunas.map(c => (
                                                <option key={c.id_comuna} value={c.id_comuna}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="zona-input-field">
                                        <label htmlFor="barrio_sel">Barrio</label>
                                        <select
                                            id="barrio_sel"
                                            value={barrioSeleccionado}
                                            onChange={(e) => setBarrioSeleccionado(e.target.value)}
                                            disabled={!comunaSeleccionada || barriosFiltrados.length === 0}
                                        >
                                            <option value="">
                                                {barriosFiltrados.length === 0 && comunaSeleccionada 
                                                    ? 'No hay barrios disponibles' 
                                                    : 'Seleccione un Barrio...'}
                                            </option>
                                            {barriosFiltrados.map(b => (
                                                <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-anadir-barrio"
                                        disabled={guardandoZona || !barrioSeleccionado}
                                    >
                                        {guardandoZona ? '...' : '+ Agregar Barrio'}
                                    </button>
                                </div>
                            </form>

                            <div className="zonas-registradas-card">
                                {Object.keys(zonasAgrupadasPorComuna).length === 0 ? (
                                    <p className="zonas-vacias-txt">No has registrado barrios de cobertura aún.</p>
                                ) : (
                                    Object.entries(zonasAgrupadasPorComuna).map(([comunaNombre, listaZonas]) => (
                                        <div key={comunaNombre} className="ciudad-grupo-contenedor">
                                            <h4 className="ciudad-grupo-titulo">📍 {comunaNombre}</h4>
                                            <div className="barrios-chips-wrapper">
                                                {listaZonas.map((z) => (
                                                    <span key={z.id_zona} className="barrio-chip">
                                                        {z.Barrio?.nombre || 'Barrio'}
                                                        <button
                                                            type="button"
                                                            className="btn-remove-chip"
                                                            onClick={() => handleEliminarZona(z.id_zona)}
                                                            title="Eliminar barrio"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}