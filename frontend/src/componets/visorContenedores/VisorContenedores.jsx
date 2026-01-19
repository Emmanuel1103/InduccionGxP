import React, { useState, useEffect } from 'react'
import { FaDatabase, FaChartBar, FaUsers, FaClipboardList, FaQuestionCircle, FaSync, FaTrashAlt } from 'react-icons/fa'
import { useAdminDatos } from '../../hooks/useAdminDatos'
import './VisorContenedores.css'

export const VisorContenedores = () => {
  const [vistaActiva, setVistaActiva] = useState('estadisticas')
  const { 
    sesiones, 
    respuestas, 
    preguntas, 
    estadisticas, 
    cargando, 
    error, 
    cargarTodo,
    vaciarSesiones,
    vaciarRespuestas
  } = useAdminDatos()

  useEffect(() => {
    cargarTodo()
  }, [])

  const recargarDatos = () => {
    cargarTodo()
  }

  const manejarVaciarSesiones = async () => {
    if (window.confirm('¿Estás seguro de eliminar TODAS las sesiones? Esta acción no se puede deshacer.')) {
      const resultado = await vaciarSesiones()
      if (resultado) {
        alert(`${resultado.total_eliminados} sesiones eliminadas exitosamente`)
        await cargarTodo()
      }
    }
  }

  const manejarVaciarRespuestas = async () => {
    if (window.confirm('¿Estás seguro de eliminar TODAS las respuestas? Esta acción no se puede deshacer.')) {
      const resultado = await vaciarRespuestas()
      if (resultado) {
        alert(`${resultado.total_eliminados} respuestas eliminadas exitosamente`)
        await cargarTodo()
      }
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='visor-contenedores'>
      {/* <div className='encabezado-visor'>
        <h2><FaDatabase /> Visor de Contenedores CosmosDB</h2>
        <button className='boton-recargar' onClick={recargarDatos} disabled={cargando}>
          <FaSync className={cargando ? 'girando' : ''} /> {cargando ? 'Cargando...' : 'Recargar'}
        </button>
      </div> */}

      {error && (
        <div className='mensaje-error'>
          Error: {error}
        </div>
      )}

      {/* Pestañas */}
      <div className='pestanas'>
        <button 
          className={`pestana ${vistaActiva === 'estadisticas' ? 'activa' : ''}`}
          onClick={() => setVistaActiva('estadisticas')}
        >
          <FaChartBar /> Estadísticas
        </button>
        <button 
          className={`pestana ${vistaActiva === 'sesiones' ? 'activa' : ''}`}
          onClick={() => setVistaActiva('sesiones')}
        >
          <FaUsers /> Sesiones ({sesiones.length})
        </button>
        <button 
          className={`pestana ${vistaActiva === 'respuestas' ? 'activa' : ''}`}
          onClick={() => setVistaActiva('respuestas')}
        >
          <FaClipboardList /> Respuestas ({respuestas.length})
        </button>
        <button 
          className={`pestana ${vistaActiva === 'preguntas' ? 'activa' : ''}`}
          onClick={() => setVistaActiva('preguntas')}
        >
          <FaQuestionCircle /> Preguntas ({preguntas.length})
        </button>
      </div>

      {/* Contenido */}
      <div className='contenido-visor'>
        {vistaActiva === 'estadisticas' && (
          <VistaEstadisticas estadisticas={estadisticas} cargando={cargando} />
        )}
        {vistaActiva === 'sesiones' && (
          <VistaSesiones 
            sesiones={sesiones} 
            formatearFecha={formatearFecha}
            onVaciar={manejarVaciarSesiones}
            cargando={cargando}
          />
        )}
        {vistaActiva === 'respuestas' && (
          <VistaRespuestas 
            respuestas={respuestas} 
            formatearFecha={formatearFecha}
            onVaciar={manejarVaciarRespuestas}
            cargando={cargando}
          />
        )}
        {vistaActiva === 'preguntas' && (
          <VistaPreguntas preguntas={preguntas} formatearFecha={formatearFecha} />
        )}
      </div>
    </div>
  )
}

const VistaEstadisticas = ({ estadisticas, cargando }) => {
  if (cargando || !estadisticas) {
    return <div className='mensaje-cargando'>Cargando estadísticas...</div>
  }

  return (
    <div className='vista-estadisticas'>
      <div className='tarjetas-estadisticas'>
        <div className='tarjeta-estadistica sesiones'>
          <FaUsers className='icono-estadistica' />
          <div className='info-estadistica'>
            <h3>{estadisticas.sesiones?.total || 0}</h3>
            <p>Sesiones Totales</p>
          </div>
        </div>

        <div className='tarjeta-estadistica respuestas'>
          <FaClipboardList className='icono-estadistica' />
          <div className='info-estadistica'>
            <h3>{estadisticas.respuestas?.total || 0}</h3>
            <p>Respuestas Guardadas</p>
          </div>
        </div>

        <div className='tarjeta-estadistica preguntas'>
          <FaQuestionCircle className='icono-estadistica' />
          <div className='info-estadistica'>
            <h3>{estadisticas.preguntas?.total_activas || 0}</h3>
            <p>Preguntas Activas</p>
          </div>
        </div>
      </div>

      {estadisticas.respuestas && estadisticas.respuestas.total > 0 && (
        <div className='detalles-estadisticas'>
          <h3>Resultados de Cuestionarios</h3>
          <div className='tarjetas-resultados'>
            <div className='tarjeta-resultado aprobado'>
              <h4>{estadisticas.respuestas.aprobados}</h4>
              <p>Aprobados (≥70%)</p>
            </div>
            <div className='tarjeta-resultado reprobado'>
              <h4>{estadisticas.respuestas.reprobados}</h4>
              <p>Reprobados (&lt;70%)</p>
            </div>
            <div className='tarjeta-resultado promedio'>
              <h4>{estadisticas.respuestas.promedio_calificacion}%</h4>
              <p>Promedio General</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const VistaSesiones = ({ sesiones, formatearFecha, onVaciar, cargando }) => {
  if (sesiones.length === 0) {
    return <div className='mensaje-vacio'>No hay sesiones registradas</div>
  }

  return (
    <div className='vista-tabla'>
      <div className='encabezado-contenedor'>
        <h3>Sesiones Registradas</h3>
        <button className='boton-vaciar' onClick={onVaciar} disabled={cargando}>
          <FaTrashAlt /> Vaciar Contenedor
        </button>
      </div>
      <div className='tabla-contenedor'>
        <table className='tabla-datos'>
          <thead>
            <tr>
              <th>ID Sesión</th>
              <th>Fecha Inicio</th>
              <th>Última Actividad</th>
              <th>% Completado</th>
              <th>Módulos</th>
              <th>Videos</th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((sesion) => (
              <tr key={sesion.id}>
                <td><code>{sesion.sesion_id?.substring(0, 8)}...</code></td>
                <td>{formatearFecha(sesion.fecha_inicio)}</td>
                <td>{formatearFecha(sesion.ultima_actividad)}</td>
                <td><span className='badge'>{sesion.porcentaje_completado}%</span></td>
                <td>{sesion.modulos_completados?.length || 0}</td>
                <td>{sesion.videos_vistos?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const VistaRespuestas = ({ respuestas, formatearFecha, onVaciar, cargando }) => {
  const [respuestaExpandida, setRespuestaExpandida] = useState(null)

  if (respuestas.length === 0) {
    return <div className='mensaje-vacio'>No hay respuestas registradas</div>
  }

  const toggleExpansion = (id) => {
    setRespuestaExpandida(respuestaExpandida === id ? null : id)
  }

  return (
    <div className='vista-respuestas'>
      <div className='encabezado-contenedor'>
        <h3>Respuestas de Cuestionarios</h3>
        <button className='boton-vaciar' onClick={onVaciar} disabled={cargando}>
          <FaTrashAlt /> Vaciar Contenedor
        </button>
      </div>
      {respuestas.map((respuesta) => (
        <div key={respuesta.id} className='tarjeta-respuesta'>
          <div className='encabezado-respuesta' onClick={() => toggleExpansion(respuesta.id)}>
            <div className='info-principal'>
              <h4>{respuesta.cuestionario_titulo}</h4>
              <p>Sesión: <code>{respuesta.sesion_id?.substring(0, 8)}...</code></p>
              <p>{formatearFecha(respuesta.fecha_respuesta)}</p>
            </div>
            <div className='calificacion-respuesta'>
              <div className={`badge-calificacion ${respuesta.calificacion >= 70 ? 'aprobado' : 'reprobado'}`}>
                {respuesta.calificacion}%
              </div>
              <p>{respuesta.respuestas_correctas}/{respuesta.total_preguntas} correctas</p>
            </div>
          </div>
          
          {respuestaExpandida === respuesta.id && (
            <div className='detalles-respuesta'>
              <h5>Respuestas Detalladas:</h5>
              {respuesta.respuestas?.map((r, idx) => (
                <div key={idx} className={`detalle-pregunta ${r.es_correcta ? 'correcta' : 'incorrecta'}`}>
                  <p><strong>#{r.orden} - {r.titulo}</strong></p>
                  <p className='texto-pregunta'>{r.pregunta}</p>
                  <div className='respuestas-comparacion'>
                    <p>✓ Correcta: <span className='respuesta-correcta'>{r.respuesta_correcta}</span></p>
                    <p>→ Usuario: <span className={r.es_correcta ? 'respuesta-correcta' : 'respuesta-incorrecta'}>
                      {r.respuesta_usuario}
                    </span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const VistaPreguntas = ({ preguntas, formatearFecha }) => {
  if (preguntas.length === 0) {
    return <div className='mensaje-vacio'>No hay preguntas configuradas</div>
  }

  // Agrupar por cuestionario
  const preguntasPorCuestionario = preguntas.reduce((acc, pregunta) => {
    const cuestionarioId = pregunta.cuestionario_id || 'sin_cuestionario'
    if (!acc[cuestionarioId]) {
      acc[cuestionarioId] = []
    }
    acc[cuestionarioId].push(pregunta)
    return acc
  }, {})

  return (
    <div className='vista-preguntas-admin'>
      {Object.entries(preguntasPorCuestionario).map(([cuestionarioId, preguntasList]) => (
        <div key={cuestionarioId} className='grupo-cuestionario'>
          <h3>{preguntasList[0]?.cuestionario_titulo || cuestionarioId}</h3>
          <p className='info-cuestionario'>ID: <code>{cuestionarioId}</code> | {preguntasList.length} preguntas</p>
          
          <div className='lista-preguntas-admin'>
            {preguntasList.sort((a, b) => a.orden - b.orden).map((pregunta) => (
              <div key={pregunta.id} className={`tarjeta-pregunta-admin ${!pregunta.activo ? 'inactiva' : ''}`}>
                <div className='encabezado-pregunta-admin'>
                  <span className='orden-badge'>#{pregunta.orden}</span>
                  <span className={`tipo-badge ${pregunta.tipo}`}>
                    {pregunta.tipo === 'opcion-multiple' ? 'Opción Múltiple' : 'V/F'}
                  </span>
                  {!pregunta.activo && <span className='estado-badge'>Inactiva</span>}
                </div>
                <p className='texto-pregunta-admin'>{pregunta.pregunta}</p>
                {pregunta.tipo === 'opcion-multiple' && pregunta.opciones && (
                  <div className='opciones-admin'>
                    {pregunta.opciones.map((opcion, idx) => (
                      <div key={idx} className={`opcion-admin ${opcion.correcta ? 'correcta' : ''}`}>
                        {opcion.id?.toUpperCase()}. {opcion.texto}
                        {opcion.correcta && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
                <small className='fecha-modificacion'>
                  Modificado: {formatearFecha(pregunta.fecha_modificacion)}
                </small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default VisorContenedores
