import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Alerta from '../components/common/Alerta';
import { clientesService } from '../services/clientes.service';
import { ubicacionesService } from '../services/ubicaciones.service';
import './PerfilCliente.css';

export default function PerfilCliente() {
    const [comunas, setComunas] = useState([]);
    const [barriosFiltrados, setBarriosFiltrados] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        correo_electronico: '',
        id_comuna: '',
        id_barrio: '',
        direccion: '',
        informacion_complementaria: ''
    });

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);
        try {
            const [dataPerfil, dataUbicaciones] = await Promise.all([
                clientesService.obtenerPerfil(),
                ubicacionesService.obtenerUbicaciones()
            ]);

            const listaComunas = dataUbicaciones || [];
            setComunas(listaComunas);

            const p = dataPerfil?.perfil || dataPerfil?.cliente || dataPerfil || {};

            // DEDUCCIÓN 3FN: La comuna se extrae del Barrio asociado
            let comunaId = p.id_comuna || p.Barrio?.id_comuna || '';
            if (!comunaId && p.id_barrio) {
                const comunaEncontrada = listaComunas.find(c =>
                    (c.Barrios || c.barrios || []).some(b => b.id_barrio === p.id_barrio)
                );
                if (comunaEncontrada) comunaId = comunaEncontrada.id_comuna;
            }

            setForm({
                nombre: p.nombre || p.usuario?.nombre || '',
                apellido: p.apellido || p.usuario?.apellido || '',
                correo_electronico: p.correo_electronico || p.usuario?.correo_electronico || '',
                id_comuna: comunaId,
                id_barrio: p.id_barrio || '',
                direccion: p.direccion || '',
                informacion_complementaria: p.informacion_complementaria || ''
            });

            // Precarga de barrios tolerante a mayúsculas/minúsculas de Sequelize
            if (comunaId) {
                const seleccionada = listaComunas.find(c => String(c.id_comuna) === String(comunaId));
                const barriosLista = seleccionada ? (seleccionada.Barrios || seleccionada.barrios || []) : [];
                setBarriosFiltrados(barriosLista);
            }
        } catch (err) {
            setError(err.message || 'Error al cargar los datos del cliente');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleComunaChange = (e) => {
        const idComuna = e.target.value;
        setForm(prev => ({ ...prev, id_comuna: idComuna, id_barrio: '' }));

        if (!idComuna) {
            setBarriosFiltrados([]);
            return;
        }

        const encontrada = comunas.find(c => String(c.id_comuna) === String(idComuna));
        const barriosLista = encontrada ? (encontrada.Barrios || encontrada.barrios || []) : [];
        setBarriosFiltrados(barriosLista);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);
        setMensaje(null);

        // Envío 3FN: solo se persiste id_barrio
        const payload = {
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            id_barrio: parseInt(form.id_barrio, 10),
            direccion: form.direccion.trim(),
            informacion_complementaria: form.informacion_complementaria ? form.informacion_complementaria.trim() : null
        };

        try {
            await clientesService.actualizarPerfil(payload);
            setMensaje('Información actualizada correctamente.');
            setModoEdicion(false);
        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="perfil-cliente-wrapper">
            <Navbar />

            <main className="perfil-container">
                <header className="perfil-header-card">
                    <div className="perfil-avatar-circle">
                        {form.nombre ? form.nombre.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="perfil-header-text">
                        <h2 className="perfil-header-title">{form.nombre} {form.apellido}</h2>
                        <p className="perfil-header-subtitle">{form.correo_electronico}</p>
                    </div>
                </header>

                <Alerta tipo="exito" mensaje={mensaje} onClose={() => setMensaje(null)} />
                <Alerta tipo="error" mensaje={error} onClose={() => setError(null)} />

                {cargando ? (
                    <p className="perfil-cargando">Cargando perfil...</p>
                ) : (
                    <div className="perfil-form-card">
                        <div className="perfil-top-actions">
                            <span className={`perfil-badge-estado ${modoEdicion ? 'modo-edicion' : 'modo-lectura'}`}>
                                {modoEdicion ? 'Modo Edición' : 'Campos Bloqueados (Solo Lectura)'}
                            </span>
                            <button
                                type="button"
                                className={modoEdicion ? 'btn-cancelar-edicion' : 'btn-actualizar-campos'}
                                onClick={() => setModoEdicion(!modoEdicion)}
                            >
                                {modoEdicion ? 'Cancelar' : '✏️ Actualizar campos'}
                            </button>
                        </div>

                        <form className="perfil-form" onSubmit={handleSubmit}>
                            <div className="perfil-form-row">
                                <div className="perfil-form-group">
                                    <label htmlFor="nombre">Nombre *</label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleInputChange}
                                        disabled={!modoEdicion}
                                        className={!modoEdicion ? 'input-bloqueado' : ''}
                                        required
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label htmlFor="apellido">Apellido *</label>
                                    <input
                                        id="apellido"
                                        type="text"
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleInputChange}
                                        disabled={!modoEdicion}
                                        className={!modoEdicion ? 'input-bloqueado' : ''}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="perfil-form-row">
                                <div className="perfil-form-group">
                                    <label htmlFor="id_comuna">Comuna (Santiago de Cali) *</label>
                                    <select
                                        id="id_comuna"
                                        value={form.id_comuna}
                                        onChange={handleComunaChange}
                                        disabled={!modoEdicion}
                                        className={!modoEdicion ? 'input-bloqueado' : ''}
                                        required
                                    >
                                        <option value="">Seleccione una Comuna...</option>
                                        {comunas.map(c => (
                                            <option key={c.id_comuna} value={c.id_comuna}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="perfil-form-group">
                                    <label htmlFor="id_barrio">Barrio *</label>
                                    <select
                                        id="id_barrio"
                                        name="id_barrio"
                                        value={form.id_barrio}
                                        onChange={handleInputChange}
                                        disabled={!modoEdicion || !form.id_comuna}
                                        className={!modoEdicion ? 'input-bloqueado' : ''}
                                        required
                                    >
                                        <option value="">Seleccione un Barrio...</option>
                                        {barriosFiltrados.map(b => (
                                            <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="perfil-form-group">
                                <label htmlFor="direccion">Dirección Domiciliaria *</label>
                                <input
                                    id="direccion"
                                    type="text"
                                    name="direccion"
                                    value={form.direccion}
                                    onChange={handleInputChange}
                                    disabled={!modoEdicion}
                                    className={!modoEdicion ? 'input-bloqueado' : ''}
                                    required
                                />
                            </div>

                            <div className="perfil-form-group">
                                <label htmlFor="informacion_complementaria">Información Complementaria (Opcional)</label>
                                <textarea
                                    id="informacion_complementaria"
                                    name="informacion_complementaria"
                                    rows="2"
                                    value={form.informacion_complementaria}
                                    onChange={handleInputChange}
                                    disabled={!modoEdicion}
                                    className={!modoEdicion ? 'input-bloqueado' : ''}
                                    placeholder="Apartamento, torre, indicaciones de llegada..."
                                />
                            </div>

                            {modoEdicion && (
                                <div className="perfil-acciones-guardar">
                                    <button type="submit" className="btn-guardar-perfil" disabled={guardando}>
                                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}