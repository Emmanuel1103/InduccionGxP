import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexto/AuthContext'
import Login from './componets/login/Login'
import PaginaBienvenida from './paginas/PaginaBienvenida'
import PaginaInduccion from './paginas/PaginaInduccion'
import PaginaConfiguracion from './paginas/PaginaConfiguracion'
import PaginaDatos from './paginas/PaginaDatos'
import RutaProtegida from './componets/rutas/RutaProtegida'

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/bienvenida" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bienvenida" element={<PaginaBienvenida />} />
          <Route path="/induccion" element={<PaginaInduccion />} />
          <Route path="/configuracion" element={
            <RutaProtegida soloAdmin>
              <PaginaConfiguracion />
            </RutaProtegida>
          } />
          <Route path="/datos" element={
            <RutaProtegida soloAdmin>
              <PaginaDatos />
            </RutaProtegida>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
