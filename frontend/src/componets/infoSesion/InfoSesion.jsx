import React from 'react'
import { FaUser, FaEdit } from 'react-icons/fa'
import './InfoSesion.css'

export const InfoSesion = ({ titulo, descripcion, nombre, onCambiarNombre }) => {
  return (
    <div className='info-sesion'>
      {/* Usuario */}
      {nombre && (
        <div className='usuario-seccion'>
          <div className='usuario-contenido'>
            <FaUser className='usuario-icono' />
            <span className='usuario-nombre'>{nombre}</span>
          </div>
          <button className='btn-editar' onClick={onCambiarNombre} title='Cambiar nombre'>
            <FaEdit />
          </button>
        </div>
      )}

      {/* Descripción */}
      <div className='descripcion-seccion'>
        <h2 className='titulo-sesion'>Sobre esta sesión</h2>
        <p className='descripcion-texto'>
          {descripcion || 'En esta sesión cubriremos los pilares fundamentales de nuestra organización. Comenzaremos con la bienvenida institucional y exploraremos cómo trabajamos bajo un modelo de gestión por procesos.'}
        </p>
      </div>
    </div>
  )
}

export default InfoSesion
