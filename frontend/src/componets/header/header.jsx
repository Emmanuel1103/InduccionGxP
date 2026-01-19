import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaCog } from 'react-icons/fa'
import './header.css'
import logoFSD from '../../assets/logoFSD.png'

export const Header = () => {
  const location = useLocation()
  const esConfiguracion = location.pathname === '/configuracion'

  return (
    <div className='header'>
        <img src={logoFSD} alt="logoFSD" className='logo' />
        <ul>
            <li>Gestión por procesos</li>
            {!esConfiguracion && (
              <li>
                <Link to='/configuracion' className='enlace-config'>
                  <FaCog /> Configuración
                </Link>
              </li>
            )}
        </ul>
    </div>
  )
}

export default Header