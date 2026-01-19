import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PaginaBienvenida from './paginas/PaginaBienvenida'
import PaginaInduccion from './paginas/PaginaInduccion'

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/bienvenida" replace />} />
        <Route path="/bienvenida" element={<PaginaBienvenida />} />
        <Route path="/induccion" element={<PaginaInduccion />} />
      </Routes>
    </Router>
  )
}

export default App
