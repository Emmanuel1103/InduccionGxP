import React, { useState } from 'react'
import { FaQuestionCircle, FaClipboardList } from 'react-icons/fa'
import Header from '../componets/header/header'
import ConfigSidebar from '../componets/sidebar/ConfigSidebar'
import MainContent from '../componets/content/MainContent'
import GestionPreguntas from '../componets/gestionPreguntas/GestionPreguntas'
import VisorRespuestas from '../componets/configuracion/VisorRespuestas'
import './PaginaConfiguracion.css'

export const PaginaConfiguracion = () => {
  const [seccionActiva, setSeccionActiva] = useState('preguntas')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'preguntas':
        return <GestionPreguntas cuestionarioId='cuestionario_gestion_procesos' />
      case 'respuestas':
        return <VisorRespuestas />
      default:
        return (
          <div className="contenido-estadisticas">
            <h2>Configuración del Sistema</h2>
            <p>Selecciona una sección del menú lateral para comenzar la administración del sistema.</p>
          </div>
        )
    }
  }

  return (
    <div className='pagina-configuracion'>
      <Header />
      
      <ConfigSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={seccionActiva}
        onSectionChange={setSeccionActiva}
      />
      
      <MainContent sidebarOpen={sidebarOpen}>
        {renderContenido()}
      </MainContent>
    </div>
  )
}

export default PaginaConfiguracion
