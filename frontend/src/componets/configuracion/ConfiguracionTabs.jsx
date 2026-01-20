import React, { useState } from 'react'
import { FaQuestionCircle, FaClipboardList, FaChartLine, FaCog } from 'react-icons/fa'
import GestionPreguntas from '../gestionPreguntas/GestionPreguntas'
import VisorRespuestas from './VisorRespuestas'
import './ConfiguracionTabs.css'

const ConfiguracionTabs = () => {
  const [tabActiva, setTabActiva] = useState('preguntas')

  const tabs = [
    {
      id: 'preguntas',
      label: 'Gestión de preguntas',
      icon: FaQuestionCircle,
    },
    {
      id: 'respuestas',
      label: 'Ver Respuestas',
      icon: FaClipboardList,
      descripcion: 'Visualizar y analizar respuestas de usuarios'
    }
  ]

  const renderContenido = () => {
    switch (tabActiva) {
      case 'preguntas':
        return <GestionPreguntas cuestionarioId='cuestionario_gestion_procesos' />
      case 'respuestas':
        return <VisorRespuestas />
      default:
        return <div>Pestaña no encontrada</div>
    }
  }

  return (
    <div className="configuracion-tabs">
      <div className="tabs-header">
        <h2 className="tabs-titulo">
          <FaCog className="icono-titulo" />
          Panel de Configuración
        </h2>
        <p className="tabs-descripcion">
          Gestiona el contenido y revisa las respuestas del sistema de inducción
        </p>
      </div>

      <div className="tabs-navigation">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab-button ${tabActiva === tab.id ? 'activa' : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <div className="tab-icono">
                <IconComponent />
              </div>
              <div className="tab-contenido">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-desc">{tab.descripcion}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="tabs-content">
        <div className="tab-panel">
          {renderContenido()}
        </div>
      </div>
    </div>
  )
}

export default ConfiguracionTabs