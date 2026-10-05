import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  function manejarSubmit(evento) {
    evento.preventDefault();
    console.log('Usuario:', usuario);
    console.log('Password:', password);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Iniciar sesión</h1>
        <form onSubmit={manejarSubmit}>
          <div className="login-field">
            <label htmlFor="usuario">Correo</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
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
          <button type="submit" className="login-button">Ingresar</button>
        </form>

        <p className="login-links">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </p>
        <p className="login-links">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;