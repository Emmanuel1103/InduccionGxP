import React, { useState } from 'react'
import { FaThumbsUp, FaUser, FaEdit } from 'react-icons/fa'
import './InfoSesion.css'

export const InfoSesion = ({ titulo, descripcion, nombre, onCambiarNombre }) => {
  const [meGusta, setMeGusta] = useState(false)

  const toggleMeGusta = () => {
    setMeGusta(!meGusta)
  }

  return (
    <div className='info-sesion'>
      <h1 className='titulo-sesion'>Persona:</h1>
      {nombre && (
        <div className='info-usuario'>
          <div className='usuario-info'>
            <FaUser className='usuario-icono' />
            <span className='usuario-nombre'>{nombre}</span>
          </div>
          <button className='btn-cambiar-nombre' onClick={onCambiarNombre} title='Cambiar nombre'>
            <FaEdit />
          </button>
        </div>
      )}

      
      {/* <button 
        className={`boton-me-gusta ${meGusta ? 'activo' : ''}`}
        onClick={toggleMeGusta}
      >
      </button> */}
      <h2 className='titulo-sesion'>Sobre esta sesión</h2>
      <p className='descripcion-sesion'>
        {descripcion || 'En esta sesión cubriremos los pilares fundamentales de nuestra organización. Comenzaremos con la bienvenida institucional y exploraremos cómo trabajamos bajo un modelo de gestión por procesos.'}
      </p>
    </div>
  )
}

export default InfoSesion
