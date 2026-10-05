import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);

  function manejarSubmit(evento) {
    evento.preventDefault();
    console.log('Correo para recuperar:', correo);
    setEnviado(true);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Recuperar contraseña</h1>

        {enviado ? (
          <>
            <p className="login-success">
              Si el correo existe en nuestro sistema, te enviamos instrucciones para restablecer tu contraseña.
            </p>
            <p className="login-links">
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={manejarSubmit}>
              <div className="login-field">
                <label htmlFor="correo">Correo</label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <button type="submit" className="login-button">Enviar instrucciones</button>
            </form>
            <p className="login-links">
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default RecuperarPassword;