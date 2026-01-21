import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaQuestionCircle, FaClipboardList, FaArrowLeft, FaUserShield, FaFolder } from 'react-icons/fa'
import './ConfigSidebar.css'

const ConfigSidebar = ({ isOpen, onMouseEnter, onMouseLeave, activeSection, onSectionChange }) => {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'preguntas',
      label: 'Gestión de preguntas',
      icon: FaQuestionCircle,
      description: 'Crear y editar preguntas'
    },
    {
      id: 'respuestas',
      label: 'Análisis de respuestas',
      icon: FaClipboardList,
      description: 'Ver respuestas de usuarios'
    },
    {
      id: 'documentos',
      label: 'Documentos de interés',
      icon: FaFolder,
      description: 'Gestionar documentos'
    },
    {
      id: 'administracion',
      label: 'Administración',
      icon: FaUserShield,
      description: 'Gestionar administradores'
    }
  ]

  const handleBackClick = () => {
    navigate('/induccion')
  }

  return (
    <div
      className={`config-sidebar ${isOpen ? 'open' : 'closed'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* <div className="sidebar-header">
        <div className="header-title">
          <h3>Configuración</h3>
        </div>
      </div> */}

      <nav className="sidebar-nav">
        {sections.map(section => {
          const IconComponent = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <IconComponent className="nav-icon" />
              <span className="nav-label">{section.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="back-btn" onClick={handleBackClick}>
          <FaArrowLeft />
          <span>Volver a Inducción</span>
        </button>
      </div>
    </div>
  )
}

export default ConfigSidebar