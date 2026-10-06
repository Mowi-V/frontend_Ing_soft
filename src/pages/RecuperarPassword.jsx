import { useState } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import './Login.css';

function RecuperarPassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  
  const enviarRecuperacion = async (e) => {
    e.preventDefault();
    setError(null);

    try {
            const respuesta = await fetch('/api/recuperacion/solicitar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: correo})
            });

            const data = await respuesta.json(); 

            if (respuesta.status === 200) {
              alert(data.msg); 
              navigate("/login");

            } else {
                setError(data.msg);
            }
        } catch (error) {
            console.error("Error de red", error);
            setError("Error de conexión con el servidor.");
        }
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
            <form onSubmit={enviarRecuperacion}>
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