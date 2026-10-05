import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [descripcionProfesional, setDescripcionProfesional] = useState('');

  function manejarSubmit(evento) {
    evento.preventDefault();

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    console.log('Nombre:', nombre);
    console.log('Apellido:', apellido);
    console.log('Correo:', correo);
    console.log('Password:', password);
    console.log('Rol:', rol);
    console.log('Dirección:', direccion);
    console.log('Descripción profesional:', descripcionProfesional);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={manejarSubmit}>
          <div className="login-field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmarPassword">Confirmar contraseña</label>
            <input
              id="confirmarPassword"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="rol">Quiero registrarme como</label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
            </select>
          </div>

          {rol === 'cliente' && (
            <div className="login-field">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
          )}

      {rol === 'proveedor' && (
      <div className="login-field">
      <label htmlFor="descripcionProfesional">Descripción profesional</label>
      <textarea
      id="descripcionProfesional"
      value={descripcionProfesional}
      onChange={(e) => setDescripcionProfesional(e.target.value)}
      rows={4}
      />
    </div>
  )}

   {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">Crear cuenta</button>
        </form>
        <p className="login-links">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;