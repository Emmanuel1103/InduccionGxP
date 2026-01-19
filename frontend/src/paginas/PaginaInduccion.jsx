import React from 'react'
import Header from '../componets/header/header'
import VideoPlayer from '../componets/videoPlayer/VideoPlayer'
import EstadoProgreso from '../componets/estadoProgreso/EstadoProgreso'
import Cuestionario from '../componets/cuestionario/Cuestionario'
import ListaRecursos from '../componets/listaRecursos/ListaRecursos'
import InfoSesion from '../componets/infoSesion/InfoSesion'
import './PaginaInduccion.css'

export const PaginaInduccion = () => {
  return (
    <div className='pagina-induccion'>
      <Header />
      <div className='cuerpo'>
        <div className='contenido-principal'>
          <div className='columna-izquierda'>
            <VideoPlayer url="https://www.youtube.com/watch?v=s3a4OQR-10M" />
            <h2 style={{ color: '#26bc58' }}> Inducción gestión por procesos</h2>
            <InfoSesion 
              titulo="Inducción gestión por procesos"
              descripcion="En esta sesión cubriremos los pilares fundamentales de nuestra organización. Comenzaremos con la bienvenida institucional y exploraremos cómo trabajamos bajo un modelo de gestión por procesos."
            />
          </div>
          <div className='columna-derecha'>
            <Cuestionario />
            <EstadoProgreso porcentaje={0} />
            
            <ListaRecursos />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaginaInduccion
