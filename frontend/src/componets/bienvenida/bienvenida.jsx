import React from 'react'
import './bienvenida.css'

export const Bienvenida = ({ onComenzar }) => {
  return (
    <div className='contenedor-bienvenida'>
      <div className='tarjeta-bienvenida'>
        <h1 className='titulo-bienvenida'>¡Bienvenido!</h1>
        <p className='subtitulo-bienvenida'>
          Inducción en Gestión por Procesos
        </p>
        <p className='descripcion-bienvenida'>
          En esta sesión aprenderás los pilares fundamentales de nuestra 
          organización. Comenzaremos con la bienvenida institucional y 
          exploraremos cómo trabajamos bajo un modelo de gestión por procesos.
        </p>
        <button className='boton-comenzar' onClick={onComenzar}>
          Comenzar Inducción
        </button>
      </div>
    </div>
  )
}

export default Bienvenida
