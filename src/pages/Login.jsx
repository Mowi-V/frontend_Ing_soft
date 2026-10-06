import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import './Login.css';

function Login() {
  const [mail, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

const handleSubmit = async (e) => {

        e.preventDefault();
        setError(null);

        try {
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: mail, contrasena: password })
            });

            const data = await respuesta.json(); 

            // 3. Evaluar la respuesta del backend
            if (respuesta.status === 200) {
                localStorage.setItem('x-token', data.token);
                localStorage.setItem('usuario_nombre', data.usuario.nombre);
                localStorage.setItem('usuario_rol', data.usuario.rol);
                
                // Redirigir al usuario dependiendo de su rol[cite: 2]
                // navigate('/dashboard'); // Usar esto si tienen react-router-dom
                window.location.href = data.usuario.rol === 'P' ? '/dashboard-proveedor' : '/dashboard-cliente'; 
            } else {
                // Credenciales incorrectas: Mostrar el mensaje de error del backend[cite: 2]
                setError(data.msg);
            }
        } catch (error) {
            console.error("Error de red", error);
            setError("Error de conexión con el servidor.");
        }
    };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Iniciar sesión</h1>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="usuario">Correo</label>
            <input
              id="mail"
              type="text"
              value={mail}
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