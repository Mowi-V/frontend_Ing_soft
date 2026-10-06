import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';
import Exploracion from './pages/Exploracion';
import DetalleServicio from './pages/DetalleServicio';
import RestablecerPassword from './pages/RestablecerPassword';
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;