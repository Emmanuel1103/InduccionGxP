import React, { useState } from 'react'
import { FaThumbsUp } from 'react-icons/fa'
import './InfoSesion.css'

export const InfoSesion = ({ titulo, descripcion }) => {
  const [meGusta, setMeGusta] = useState(false)

  const toggleMeGusta = () => {
    setMeGusta(!meGusta)
  }

  return (
    <div className='info-sesion'>
      <h2 className='titulo-sesion'>Sobre esta sesión</h2>
      <p className='descripcion-sesion'>
        {descripcion || 'En esta sesión cubriremos los pilares fundamentales de nuestra organización. Comenzaremos con la bienvenida institucional y exploraremos cómo trabajamos bajo un modelo de gestión por procesos.'}
      </p>
      {/* <button 
        className={`boton-me-gusta ${meGusta ? 'activo' : ''}`}
        onClick={toggleMeGusta}
      >
      </button> */}
    </div>
  )
}

export default InfoSesion
