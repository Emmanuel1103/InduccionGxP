import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCog, FaSignOutAlt, FaUser, FaBars } from 'react-icons/fa'
import { useAuth } from '../../contexto/AuthContext'
import LoginModal from '../login/LoginModal'
import './header.css'
import logoFSD from '../../assets/logoFSD.png'

export const Header = ({ onToggleSidebar, esConfiguracion: esConfiguracionProp }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, esAdministrador, cerrarSesion } = useAuth()
  const esConfiguracion = esConfiguracionProp ?? location.pathname === '/configuracion'
  const [mostrarLoginModal, setMostrarLoginModal] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navigate('/induccion')
  }

  const manejarClickConfiguracion = () => {
    if (!usuario) {
      setMostrarLoginModal(true)
    } else if (esAdministrador) {
      navigate('/configuracion')
    }
  }

  return (
    <>
      <div className='header'>
          <div className='header-left'>
            {esConfiguracion && onToggleSidebar && (
              <button onClick={onToggleSidebar} className='btn-hamburguesa-mobile btn-sidebar-toggle'>
                <FaBars />
              </button>
            )}
            <img src={logoFSD} alt="logoFSD" className='logo' />
          </div>
          
          {/* Botón hamburguesa para menú de opciones (solo móvil) */}
          <button 
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} 
            className='btn-menu-movil'
          >
            <FaBars />
          </button>
          
          {/* Menú desktop (oculto en móvil) */}
          <ul className='menu-desktop'>
              {esAdministrador && !esConfiguracion && (
                <li>
                  <button onClick={() => navigate('/configuracion')} className='enlace-config'>
                    <FaCog /> Configuración
                  </button>
                </li>
              )}
              {!usuario && (
                <li>
                  <button onClick={() => setMostrarLoginModal(true)} className='btn-login-header'>
                    <FaUser /> Iniciar sesión
                  </button>
                </li>
              )}
              {usuario && (
                <>
                  <li>
                    <button onClick={manejarCerrarSesion} className='btn-cerrar-sesion'>
                      <FaSignOutAlt /> Salir
                    </button>
                  </li>
                </>
              )}
          </ul>
          
          {/* Menú móvil desplegable */}
          {menuMovilAbierto && (
            <div className='menu-movil-desplegable'>
              {esAdministrador && !esConfiguracion && (
                <button 
                  onClick={() => {
                    navigate('/configuracion')
                    setMenuMovilAbierto(false)
                  }} 
                  className='menu-movil-item'
                >
                  <FaCog /> Configuración
                </button>
              )}
              {!usuario && (
                <button 
                  onClick={() => {
                    setMostrarLoginModal(true)
                    setMenuMovilAbierto(false)
                  }} 
                  className='menu-movil-item'
                >
                  <FaUser /> Iniciar sesión
                </button>
              )}
              {usuario && (
                <button 
                  onClick={() => {
                    manejarCerrarSesion()
                    setMenuMovilAbierto(false)
                  }} 
                  className='menu-movil-item'
                >
                  <FaSignOutAlt /> Salir
                </button>
              )}
            </div>
          )}
      </div>
      
      <LoginModal 
        isOpen={mostrarLoginModal} 
        onClose={() => setMostrarLoginModal(false)} 
      />
    </>
  )
}

export default Header