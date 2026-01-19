import React from 'react'
import { Link } from 'react-router-dom'
import { FaDatabase } from 'react-icons/fa'
import Header from '../componets/header/header'
import GestionPreguntas from '../componets/gestionPreguntas/GestionPreguntas'
import './PaginaConfiguracion.css'

export const PaginaConfiguracion = () => {
  return (
    <div className='pagina-configuracion'>
      <Header />
      <div className='contenedor-config'>
        <div className='navegacion-config'>
          <Link to='/induccion' className='enlace-volver'>
            ← Volver a Inducción
          </Link>
          <Link to='/datos' className='enlace-datos'>
            <FaDatabase /> Ver Datos Guardados
          </Link>
        </div>
        <GestionPreguntas cuestionarioId='cuestionario_gestion_procesos' />
      </div>
    </div>
  )
}

export default PaginaConfiguracion
