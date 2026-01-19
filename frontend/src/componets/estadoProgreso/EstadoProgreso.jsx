import React from 'react'
import './EstadoProgreso.css'

export const EstadoProgreso = ({ porcentaje = 0 }) => {
  return (
    <div className='estado-progreso'>
      <h3 className='titulo-estado'>Tu estado</h3>
      <div className='info-progreso'>
        <span className='etiqueta-progreso'>Progreso</span>
        <span className='porcentaje-progreso'>{porcentaje}%</span>
      </div>
      <div className='barra-progreso-contenedor'>
        <div 
          className='barra-progreso-relleno' 
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  )
}

export default EstadoProgreso
