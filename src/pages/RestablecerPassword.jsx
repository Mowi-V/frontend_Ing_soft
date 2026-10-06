import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css'; // Reutilizando los estilos de tu login

function RestablecerPassword() {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  // Este hook nos permite leer los parámetros de la URL (ej. ?token=abcd...)
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validaciones locales
    if (!token) {
      setError('Enlace inválido o incompleto. Faltan credenciales.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      // 2. Petición POST a tu API REST
      const respuesta = await fetch('/api/recuperacion/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token, 
          nueva_contrasena: nuevaContrasena 
        })
      });

      const data = await respuesta.json();

      if (respuesta.status === 200) {
        alert('Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
        navigate('/login'); // Redirigimos al usuario al login
      } else {
        setError(data.msg || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      console.error("Error de red", error);
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Restablecer Contraseña</h1>
        <p>Ingresa tu nueva contraseña a continuación.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
            <input
              id="nuevaContrasena"
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
            <input
              id="confirmarContrasena"
              type="password"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">Guardar Contraseña</button>
        </form>
      </div>
    </div>
  );
}

export default RestablecerPassword;