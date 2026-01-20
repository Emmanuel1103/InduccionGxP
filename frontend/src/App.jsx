import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PaginaBienvenida from './paginas/PaginaBienvenida'
import PaginaInduccion from './paginas/PaginaInduccion'
import PaginaConfiguracion from './paginas/PaginaConfiguracion'
import PaginaDatos from './paginas/PaginaDatos'

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/bienvenida" replace />} />
        <Route path="/bienvenida" element={<PaginaBienvenida />} />
        <Route path="/induccion" element={<PaginaInduccion />} />
        <Route path="/configuracion" element={<PaginaConfiguracion />} />
        <Route path="/datos" element={<PaginaDatos />} />
      </Routes>
    </Router>
  )
}

export default App
