import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [mail, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

const handleSubmit = async (e) => {
        // Prevenimos que la página se recargue al enviar el formulario
        e.preventDefault();
        setError(null);

        try {
            // 2. Hacer la petición a tu API REST de Node.js
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: mail, contrasena: password })
            });

            const data = await respuesta.json(); // Extraemos la respuesta del backend[cite: 2]

            // 3. Evaluar la respuesta del backend
            if (respuesta.status === 200) {
                // ¡Éxito! Guardamos el token y los datos en el Local Storage[cite: 2]
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