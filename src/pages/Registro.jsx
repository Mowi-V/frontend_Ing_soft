import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Registro() {

  const navigate = useNavigate();
  // Estados originales del componente
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [descripcionProfesional, setDescripcionProfesional] = useState('');

  const [ciudades, setCiudades] = useState([]);
  const [barriosDisponibles, setBarriosDisponibles] = useState([]);
  const [idCiudad, setIdCiudad] = useState('');
  const [idBarrio, setIdBarrio] = useState('');
  const [informacionComplementaria, setInformacionComplementaria] = useState('');

  // Cargar las ciudades desde el backend al montar el componente
  useEffect(() => {
    const obtenerUbicaciones = async () => {
      try {
        const respuesta = await fetch('/api/ubicaciones');
        const data = await respuesta.json();
        if (data.ciudades) {
          setCiudades(data.ciudades);
        }
      } catch (error) {
        console.error('Error al cargar el diccionario de ubicaciones', error);
      }
    };
    obtenerUbicaciones();
  }, []);

  // Filtrar barrios dependiendo de la ciudad seleccionada
  const manejarCambioCiudad = (e) => {
    const ciudadSeleccionada = e.target.value;
    setIdCiudad(ciudadSeleccionada);
    setIdBarrio(''); // Limpiar el barrio si se cambia la ciudad

    const ciudadEncontrada = ciudades.find(c => c.id_ciudad.toString() === ciudadSeleccionada);
    if (ciudadEncontrada && ciudadEncontrada.Barrios) {
      setBarriosDisponibles(ciudadEncontrada.Barrios);
    } else {
      setBarriosDisponibles([]);
    }
  };

  function manejarSubmit(evento) {
    evento.preventDefault();

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    


  }

const handleSubmit = async (e) => {
    // 1. Prevenimos que la página se recargue al enviar el formulario
    e.preventDefault();
    setError(null);

    // 2. Validación de contraseñas local[cite: 4]
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // 3. Construimos el objeto de datos (payload) que espera el backend
    const payload = {
        nombre,
        apellido,
        correo_electronico: correo, // Mapeo al nombre que espera la BD
        contrasena: password,       // Mapeo al nombre que espera la BD
        rol                         // Envía 'cliente' o 'proveedor'
    };

    // 4. Añadimos los campos específicos según el rol seleccionado[cite: 4]
    if (rol === 'cliente') {
        payload.id_ciudad = parseInt(idCiudad);
        payload.id_barrio = parseInt(idBarrio);
        payload.direccion = direccion;
        payload.informacion_complementaria = informacionComplementaria;
    } else if (rol === 'proveedor') {
        payload.descripcion_perfil = descripcionProfesional;
    }

    try {
        // 5. Hacer la petición POST a tu API REST de registro
        const respuesta = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json(); // Extraemos la respuesta del backend

        // 6. Evaluar la respuesta del backend (Código 201 significa Creado)
        if (respuesta.status === 201) {
            // ¡Éxito! El usuario fue registrado. 
            // Mostramos una alerta (opcional) y redirigimos al Login.
            alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
            navigate('/login');
        } else {
            // Error de validación en el backend (ej. correo ya existe, faltan campos)
            setError(data.msg || JSON.stringify(data.errores || 'Error al registrar la cuenta'));
        }
    } catch (error) {
        console.error("Error de red", error);
        setError("Error de conexión con el servidor.");
    }
  };


  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit}>
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

          {/* 🌟 CAMPOS EXCLUSIVOS PARA EL CLIENTE */}
          {rol === 'cliente' && (
            <>
              <div className="login-field">
                <label htmlFor="ciudad">Ciudad</label>
                <select id="ciudad" value={idCiudad} onChange={manejarCambioCiudad} required>
                  <option value="">Seleccione una ciudad...</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="barrio">Barrio / Sector</label>
                <select id="barrio" value={idBarrio} onChange={(e) => setIdBarrio(e.target.value)} required disabled={!idCiudad}>
                  <option value="">Seleccione un barrio...</option>
                  {barriosDisponibles.map((barrio) => (
                    <option key={barrio.id_barrio} value={barrio.id_barrio}>
                      {barrio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Calle 123 # 45-67"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="informacionComplementaria">Información complementaria</label>
                <textarea
                  id="informacionComplementaria"
                  value={informacionComplementaria}
                  onChange={(e) => setInformacionComplementaria(e.target.value)}
                  rows={2}
                  placeholder="Ej. Conjunto residencial Las Palmas, apartamento 301..."
                />
              </div>
            </>
          )}

          {/* CAMPOS EXCLUSIVOS PARA EL PROVEEDOR */}
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