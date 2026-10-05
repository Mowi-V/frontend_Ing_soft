import { useParams, Link } from 'react-router-dom';
import servicios from '../data/servicios';
import './DetalleServicio.css';

function DetalleServicio() {
  const { id } = useParams();
  const servicio = servicios.find((s) => s.id === Number(id));

  if (!servicio) {
    return (
      <div className="detalle-page">
        <p>Servicio no encontrado.</p>
        <Link to="/exploracion">Volver a explorar</Link>
      </div>
    );
  }

  return (
    <div className="detalle-page">
      <Link to="/exploracion" className="detalle-volver">← Volver</Link>

      <img
        src={servicio.imagenPrincipal}
        alt={servicio.nombre}
        className="detalle-imagen"
      />

      <div className="detalle-contenido">
        <h1>{servicio.nombre}</h1>
        <p className="detalle-proveedor">{servicio.proveedor} — {servicio.zona}</p>
        <p className="detalle-precio">${servicio.precio.toLocaleString()}</p>
        <p className="detalle-duracion">Duración estimada: {servicio.duracionMinutos} minutos</p>

        <h2>Descripción</h2>
        <p>{servicio.descripcion}</p>

        {servicio.insumos.length > 0 && (
          <>
            <h2>Insumos y equipos utilizados</h2>
            <ul>
              {servicio.insumos.map((insumo, index) => (
                <li key={index}>{insumo}</li>
              ))}
            </ul>
          </>
        )}

        {servicio.galeria.length > 0 && (
          <>
            <h2>Galería</h2>
            <div className="detalle-galeria">
              {servicio.galeria.map((foto, index) => (
                <img key={index} src={foto} alt={`${servicio.nombre} ${index + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DetalleServicio;