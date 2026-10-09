import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';
import Exploracion from './pages/Exploracion';
import DetalleServicio from './pages/DetalleServicio';
import RestablecerPassword from './pages/RestablecerPassword';
import DashboardCliente from './pages/DashboardCliente';
import PerfilCliente from './pages/PerfilCliente';
import DashboardProveedor from './pages/DashboardProveedor';
import CrearServicio from './pages/CrearServicio';
import PerfilProveedor from './pages/PerfilProveedor';
import DetalleProveedor from './pages/DetalleProveedor';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/exploracion" element={<Exploracion />} />
        <Route path="/servicios/:id" element={<DetalleServicio />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
        <Route path="/dashboard-cliente" element={<DashboardCliente />} />
        <Route path="/perfil-cliente" element={<PerfilCliente />} />
        <Route path="/dashboard-proveedor" element={<DashboardProveedor />} />
        <Route path="/crear-servicio" element={<CrearServicio />} />
        <Route path="/perfil-proveedor" element={<PerfilProveedor />} />
        <Route path="/proveedor/:id" element={<DetalleProveedor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;