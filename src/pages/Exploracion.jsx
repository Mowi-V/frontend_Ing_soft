import { useState } from 'react';
import { Link } from 'react-router-dom';
import servicios from '../data/servicios';
import './Exploracion.css';

function Exploracion() {
  const [busqueda, setBusqueda] = useState('');

  const serviciosFiltrados = servicios.filter((servicio) => {
    const texto = busqueda.toLowerCase();
    return (
      servicio.nombre.toLowerCase().includes(texto) ||
      servicio.categoria.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="exploracion-page">
      <h1>Explorar servicios</h1>

      <input
        type="text"
        className="exploracion-buscador"
        placeholder="Buscar servicios o proveedores..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="exploracion-lista">
        {serviciosFiltrados.map((servicio) => (
          <Link
            to={`/servicios/${servicio.id}`}
            key={servicio.id}
            className="servicio-card"
          >
            <img src={servicio.imagenPrincipal} alt={servicio.nombre} />
            <div className="servicio-info">
              <h2>{servicio.nombre}</h2>
              <p className="servicio-proveedor">{servicio.proveedor}</p>
              <p className="servicio-zona">{servicio.zona}</p>
              <p className="servicio-precio">${servicio.precio.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {serviciosFiltrados.length === 0 && (
        <p className="exploracion-vacio">No se encontraron resultados.</p>
      )}
    </div>
  );
}

export default Exploracion;