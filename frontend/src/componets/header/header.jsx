import React from 'react'
import './header.css'
import logoFSD from '../../assets/logoFSD.png'

export const Header = () => {
  return (
    <div className='header'>
        <img src={logoFSD} alt="logoFSD" className='logo' />
        <ul>
            <li>Gestión por procesos</li>
            {/* <li>Acerca de</li>
            <li>Contacto</li>    */}
        </ul>
    </div>
  )
}

export default Header