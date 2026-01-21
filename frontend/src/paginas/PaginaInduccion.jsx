import React, { useState, useEffect } from 'react'
import { FaUser, FaTimes } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import Header from '../componets/header/header'
import VideoPlayer from '../componets/videoPlayer/VideoPlayer'
import Cuestionario from '../componets/cuestionario/Cuestionario'
import ListaRecursos from '../componets/listaRecursos/ListaRecursos'
import InfoSesion from '../componets/infoSesion/InfoSesion'
import { configuracionAPI } from '../servicios/api'
import './PaginaInduccion.css'

export const PaginaInduccion = () => {
  const [searchParams] = useSearchParams()
  const [mostrarModalNombre, setMostrarModalNombre] = useState(false)
  const [nombre, setNombre] = useState('')
  const [nombreTemporal, setNombreTemporal] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [configuracion, setConfiguracion] = useState(null)

  useEffect(() => {
    // Cargar configuración de inducción
    const cargarConfiguracion = async () => {
      try {
        const config = await configuracionAPI.obtenerInduccion()
        setConfiguracion(config)
      } catch (error) {
        console.error('Error al cargar configuración:', error)
        // Usar valores por defecto si falla
        setConfiguracion({
          titulo: 'Inducción gestión por procesos',
          video_url: 'https://www.youtube.com/watch?v=s3a4OQR-10M',
          descripcion: 'En esta sesión cubriremos los pilares fundamentales de nuestra organización.'
        })
      }
    }
    cargarConfiguracion()
  }, [])

  useEffect(() => {
    // Verificar si hay error de autenticación
    const error = searchParams.get('error')
    if (error === 'sin_permisos') {
      setMensajeError('No tienes permisos de administrador')
      setTimeout(() => setMensajeError(''), 5000)
    } else if (error === 'callback_failed' || error === 'no_code') {
      setMensajeError('Error al iniciar sesión')
      setTimeout(() => setMensajeError(''), 5000)
    }

    // Verificar si ya hay un nombre guardado
    const nombreGuardado = sessionStorage.getItem('nombreUsuario')
    if (!nombreGuardado) {
      setMostrarModalNombre(true)
    } else {
      setNombre(nombreGuardado)
    }
  }, [searchParams])

  const guardarNombre = () => {
    if (nombreTemporal.trim()) {
      setNombre(nombreTemporal.trim())
      sessionStorage.setItem('nombreUsuario', nombreTemporal.trim())
      setMostrarModalNombre(false)
    }
  }

  const cambiarNombre = () => {
    setNombreTemporal(nombre)
    setMostrarModalNombre(true)
  }

  if (!configuracion) {
    return (
      <div className='pagina-induccion'>
        <Header />
        <div className='cuerpo'>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='pagina-induccion'>
      <Header />

      {mensajeError && (
        <div className="mensaje-error-login">
          {mensajeError}
        </div>
      )}

      <div className='cuerpo'>
        <div className='contenido-principal'>
          <div className='columna-izquierda'>
            <VideoPlayer url={configuracion.video_url} />
            <h2 style={{ color: '#26bc58' }}>{configuracion.titulo}</h2>
            <InfoSesion
              titulo={configuracion.titulo}
              descripcion={configuracion.descripcion}
              nombre={nombre}
              onCambiarNombre={cambiarNombre}
            />
          </div>
          <div className='columna-derecha'>
            <Cuestionario cuestionarioId="cuestionario_gestion_procesos" nombre={nombre} />
            <ListaRecursos />
          </div>
        </div>
      </div>

      {/* Modal para capturar nombre */}
      {mostrarModalNombre && (
        <ModalNombre
          nombre={nombreTemporal}
          onChange={setNombreTemporal}
          onGuardar={guardarNombre}
          esEdicion={Boolean(nombre)}
        />
      )}
    </div>
  )
}

const ModalNombre = ({ nombre, onChange, onGuardar, esEdicion }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar()
  }

  return (
    <div className="modal-overlay modal-nombre">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <FaUser />
            {esEdicion ? 'Cambiar Nombre' : 'Bienvenido a la inducción'}
          </h3>
        </div>

        <div className="modal-body">
          {!esEdicion && (
            <p>Para comenzar con la inducción, por favor ingresa tu nombre:</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="campo-nombre">
              <label htmlFor="nombre">Nombre completo:</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                autoFocus
                required
              />
            </div>

            <div className="botones-modal">
              <button
                type="submit"
                className="btn-guardar"
                disabled={!nombre.trim()}
              >
                {esEdicion ? 'Actualizar' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaginaInduccion
