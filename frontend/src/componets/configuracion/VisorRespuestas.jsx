import React, { useState, useEffect } from 'react'
import { FaSearch, FaFilter, FaDownload, FaEye, FaClipboardList, FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDatabase, FaTimes, FaCode, FaTrash } from 'react-icons/fa'
import { adminAPI } from '../../servicios/api'
import '../../estilos/configuracion-comun.css'
import './VisorRespuestas.css'

const VisorRespuestas = () => {
  const [respuestas, setRespuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')
  /* Removed duplicate declaration */
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null)
  const [mostrarDatosRaw, setMostrarDatosRaw] = useState(false)

  useEffect(() => {
    cargarRespuestas()
  }, [])

  const cargarRespuestas = async () => {
    try {
      setCargando(true)
      const datos = await adminAPI.obtenerTodasRespuestas()
      setRespuestas(datos.respuestas || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const respuestasFiltradas = respuestas.filter(respuesta => {
    return respuesta.cuestionario_titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      respuesta.nombre?.toLowerCase().includes(filtro.toLowerCase())
  })

  const exportarCSV = () => {
    const headers = ['Nombre', 'Cuestionario', 'Calificación', 'Estado', 'Fecha']
    const filas = respuestasFiltradas.map(r => [
      r.nombre || 'Sin nombre',
      r.cuestionario_titulo,
      r.calificacion,
      'Terminado',
      formatearFecha(r.fecha_completado)
    ])

    const contenidoCSV = [headers, ...filas]
      .map(fila => fila.map(campo => `"${campo}"`).join(','))
      .join('\n')

    const blob = new Blob([contenidoCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `respuestas_${new Date().toISOString().split('T')[0]}.csv`
    enlace.click()
  }

  const eliminarRespuesta = async (respuestaId, nombreUsuario) => {
    if (window.confirm(`¿Estás seguro de eliminar la respuesta de ${nombreUsuario}? Esta acción no se puede deshacer.`)) {
      try {
        await adminAPI.eliminarRespuesta(respuestaId)
        await cargarRespuestas() // Recargar la lista
        alert('Respuesta eliminada exitosamente')
      } catch (error) {
        alert(`Error al eliminar la respuesta: ${error.message}`)
      }
    }
  }

  if (cargando) {
    return (
      <div className="visor-respuestas">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando respuestas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="visor-respuestas">
        <div className="error-container">
          <FaTimesCircle className="error-icon" />
          <h3>Error al cargar respuestas</h3>
          <p>{error}</p>
          <button onClick={cargarRespuestas} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="visor-respuestas">
      <div className='encabezado-gestion'>
        <h2>Análisis de respuestas</h2>
        <div className='botones-encabezado'>
          <button onClick={() => setMostrarDatosRaw(true)} className="boton-crear">
            <FaDatabase />
            Ver datos del contenedor
          </button>
          <button onClick={exportarCSV} className="boton-crear">
            <FaDownload />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="respuestas-filtros">
        <div className="filtro-busqueda">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cuestionario o nombre..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-busqueda"
          />
        </div>


      </div>

      {respuestasFiltradas.length === 0 ? (
        <div className="empty-state">
          <FaClipboardList className="empty-icon" />
          <h3>No hay respuestas</h3>
          <p>No se encontraron respuestas que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="respuestas-grid">
          {respuestasFiltradas.map((respuesta) => (
            <div key={respuesta.id} className="respuesta-card">
              <div className="card-header">
                <div className="cuestionario-titulo">
                  {respuesta.cuestionario_titulo}
                </div>
                <div className={`estado-badge aprobado`}>
                  <FaCheckCircle />
                  Terminado
                </div>
              </div>

              <div className="card-stats">
                <div className="stat">
                  <span className="stat-label">Calificación:</span>
                  <span className="stat-value">{respuesta.calificacion}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Preguntas:</span>
                  <span className="stat-value">{respuesta.respuestas_correctas}/{respuesta.total_preguntas}</span>
                </div>
              </div>

              <div className="card-meta">
                <div className="meta-item">
                  <FaUser />
                  <span>{respuesta.nombre || 'Sin nombre'}</span>
                </div>
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>{formatearFecha(respuesta.fecha_completado)}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => setRespuestaSeleccionada(respuesta)}
                  className="btn-ver-detalle"
                >
                  <FaEye />
                  Ver Detalle
                </button>
                <button
                  onClick={() => eliminarRespuesta(respuesta.id, respuesta.nombre || 'Sin nombre')}
                  className="btn-eliminar-respuesta"
                  title="Eliminar respuesta"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {respuestaSeleccionada && (
        <DetalleRespuesta
          respuesta={respuestaSeleccionada}
          onCerrar={() => setRespuestaSeleccionada(null)}
        />
      )}

      {mostrarDatosRaw && (
        <ModalDatosContenedor
          respuestas={respuestas}
          onCerrar={() => setMostrarDatosRaw(false)}
        />
      )}
    </div>
  )
}

const DetalleRespuesta = ({ respuesta, onCerrar }) => {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalle de Respuesta</h3>
          <button onClick={onCerrar} className="btn-cerrar">×</button>
        </div>

        <div className="modal-body">
          <div className="respuesta-info">
            <h4>{respuesta.cuestionario_titulo}</h4>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{respuesta.nombre || 'Sin nombre'}</span>
              </div>
              <div className="info-item">
                <label>Calificación:</label>
                <span>{respuesta.calificacion}%</span>
              </div>
              <div className="info-item">
                <label>Estado:</label>
                <span className='aprobado'>
                  Terminado
                </span>
              </div>
              <div className="info-item">
                <label>Fecha:</label>
                <span>{new Date(respuesta.fecha_completado).toLocaleString('es-ES')}</span>
              </div>
            </div>
          </div>

          <div className="respuestas-detalle">
            <h5>Respuestas por Pregunta</h5>
            {respuesta.respuestas?.map((resp, index) => (
              <div key={index} className={`pregunta-detalle ${resp.es_correcta ? 'correcta' : 'incorrecta'}`}>
                <div className="pregunta-numero">#{resp.orden}</div>
                <div className="pregunta-contenido">
                  <h6>{resp.titulo}</h6>
                  <p>{resp.pregunta}</p>
                  <div className="respuesta-usuario">
                    <strong>Respuesta del usuario:</strong> {resp.respuesta_usuario}
                  </div>
                </div>
                <div className="respuesta-estado">
                  {resp.es_correcta ? <FaCheckCircle className="correcto" /> : <FaTimesCircle className="incorrecto" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ModalDatosContenedor = ({ respuestas, onCerrar }) => {
  const [mostrarJSON, setMostrarJSON] = useState(true)
  const [respuestaExpandida, setRespuestaExpandida] = useState(null)

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(JSON.stringify(respuestas, null, 2))
    alert('Datos copiados al portapapeles')
  }

  const descargarJSON = () => {
    const blob = new Blob([JSON.stringify(respuestas, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `respuestas_raw_${new Date().toISOString().split('T')[0]}.json`
    enlace.click()
  }

  return (
    <div className="modal-overlay datos-contenedor-modal" onClick={onCerrar}>
      <div className="modal-content datos-contenedor" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaDatabase />
            Datos del Contenedor de Respuestas
          </h3>
          <button onClick={onCerrar} className="btn-cerrar">×</button>
        </div>

        <div className="modal-body">
          <div className="datos-info">
            <p><strong>Total de respuestas:</strong> {respuestas.length}</p>
            <p><strong>Estructura de datos:</strong> Array de objetos con respuestas de cuestionarios</p>
          </div>

          <div className="datos-actions">
            <button onClick={() => setMostrarJSON(!mostrarJSON)} className="btn-toggle">
              <FaCode />
              {mostrarJSON ? 'Vista Resumida' : 'Vista JSON'}
            </button>
            <button onClick={copiarAlPortapapeles} className="btn-copy">
              <FaClipboardList />
              Copiar JSON
            </button>
            <button onClick={descargarJSON} className="btn-download">
              <FaDownload />
              Descargar JSON
            </button>
          </div>

          {mostrarJSON ? (
            <div className="json-container">
              <pre className="json-content">
                {JSON.stringify(respuestas, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="datos-resumen">
              <h4>Estructura de cada respuesta:</h4>
              {respuestas.length > 0 && (
                <div className="estructura-datos">
                  <h5>Campos principales:</h5>
                  <ul>
                    {Object.keys(respuestas[0]).map(key => (
                      <li key={key}>
                        <strong>{key}:</strong> {typeof respuestas[0][key]}
                        {key === 'respuestas' && Array.isArray(respuestas[0][key]) &&
                          ` (Array con ${respuestas[0][key]?.length || 0} elementos)`
                        }
                      </li>
                    ))}
                  </ul>

                  <h5>Ejemplo de respuesta completa:</h5>
                  <div className="ejemplo-respuesta">
                    <button
                      onClick={() => setRespuestaExpandida(respuestaExpandida ? null : 0)}
                      className="btn-expandir"
                    >
                      {respuestaExpandida !== null ? 'Contraer' : 'Expandir'} Primera Respuesta
                    </button>

                    {respuestaExpandida !== null && (
                      <pre className="respuesta-ejemplo">
                        {JSON.stringify(respuestas[0], null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisorRespuestas