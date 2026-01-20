import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaQuestionCircle, FaClipboardList, FaArrowLeft, FaBars, FaTimes } from 'react-icons/fa'
import './ConfigSidebar.css'

const ConfigSidebar = ({ isOpen, onToggle, activeSection, onSectionChange }) => {
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
    }
  ]

  const handleBackClick = () => {
    navigate('/induccion')
  }

  return (
    <div className={`config-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen ? (
          <>
            <div className="header-title">
              <h3>Configuración</h3>
            </div>
            <button className="close-btn" onClick={onToggle}>
              <FaTimes />
            </button>
          </>
        ) : (
          <button className="toggle-btn" onClick={onToggle}>
            <FaBars />
          </button>
        )}
      </div>

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