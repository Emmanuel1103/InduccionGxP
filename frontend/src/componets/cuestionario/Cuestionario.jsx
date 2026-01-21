import React, { useState, useEffect, useRef } from 'react'
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { useCuestionario } from '../../hooks/useCuestionario'
import { preguntasAPI } from '../../servicios/api'
import './Cuestionario.css'

export const Cuestionario = ({ cuestionarioId = 'cuestionario_gestion_procesos', nombre }) => {
  const [respuestas, setRespuestas] = useState({})
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [respuestaVerificada, setRespuestaVerificada] = useState({})
  const [preguntas, setPreguntas] = useState([])
  const [cargandoPreguntas, setCargandoPreguntas] = useState(true)
  const [errorPreguntas, setErrorPreguntas] = useState(null)
  const [tiempoInicio] = useState(Date.now())
  const respuestasEnviadas = useRef(false) // Bandera para evitar envíos duplicados

  const { enviarRespuestas, enviando, resultado, error } = useCuestionario(
    nombre || 'Sin nombre',
    cuestionarioId,
    'Evaluación - Gestión por Procesos'
  )

  // Cargar preguntas desde la API
  useEffect(() => {
    const cargarPreguntas = async () => {
      try {
        setCargandoPreguntas(true)
        const preguntasDB = await preguntasAPI.obtenerPreguntas(cuestionarioId)

        // Convertir formato de DB a formato del componente
        const preguntasFormateadas = preguntasDB.map(p => ({
          id: p.id,
          tipo: p.tipo,
          pregunta: p.pregunta,
          opciones: p.opciones || [],
          respuestaCorrecta: p.respuesta_correcta,
          // Campos para Likert
          escala_min: p.escala_min,
          escala_max: p.escala_max,
          etiquetas: p.etiquetas || {},
          // Campos para preguntas abiertas
          longitud_minima: p.longitud_minima
        }))

        setPreguntas(preguntasFormateadas)
        setCargandoPreguntas(false)
      } catch (err) {
        console.error('Error al cargar preguntas:', err)
        setErrorPreguntas(err.message)
        setCargandoPreguntas(false)
      }
    }

    if (cuestionarioId) {
      cargarPreguntas()
    }
  }, [cuestionarioId])

  const manejarRespuesta = (preguntaId, respuesta) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: respuesta
    })
    // Resetear verificación al cambiar respuesta
    setRespuestaVerificada({
      ...respuestaVerificada,
      [preguntaId]: false
    })
  }

  const esRespuestaCorrecta = (pregunta) => {
    const respuesta = respuestas[pregunta.id]
    if (respuesta === undefined && respuesta !== false) return null

    switch (pregunta.tipo) {
      case 'opcion-multiple':
        const opcionSeleccionada = pregunta.opciones.find(op => op.id === respuesta)
        return opcionSeleccionada?.correcta

      case 'opcion-multiple-multi':
        // Verificar que todas las seleccionadas sean correctas
        // y que todas las correctas estén seleccionadas
        const seleccionadas = Array.isArray(respuesta) ? respuesta : []
        const correctas = pregunta.opciones.filter(op => op.correcta).map(op => op.id)
        return seleccionadas.length === correctas.length &&
          seleccionadas.every(id => correctas.includes(id))

      case 'verdadero-falso':
        return respuesta === pregunta.respuestaCorrecta

      case 'likert':
      case 'abierta':
        return true // Siempre correcta para efectos de calificación

      default:
        return null
    }
  }

  const puedeAvanzar = () => {
    const respuesta = respuestas[pregunta.id]

    // Verificar que haya una respuesta
    if (respuesta === undefined || respuesta === null || respuesta === '') {
      return false
    }

    // Validaciones específicas por tipo
    switch (pregunta.tipo) {
      case 'opcion-multiple-multi':
        // Debe tener al menos una opción seleccionada
        return Array.isArray(respuesta) && respuesta.length > 0

      case 'abierta':
        // Verificar longitud mínima si está configurada
        if (pregunta.longitud_minima) {
          return respuesta.length >= pregunta.longitud_minima
        }
        return respuesta.trim().length > 0

      case 'likert':
        // Debe tener un valor seleccionado
        return respuesta !== undefined && respuesta !== null

      default:
        return respuesta !== undefined && respuesta !== null && respuesta !== ''
    }
  }

  const verificarYAvanzar = () => {
    // Para tipos sin validación de correcto/incorrecto, verificar restricciones y avanzar
    if (['likert', 'abierta'].includes(pregunta.tipo)) {
      if (!puedeAvanzar()) {
        setRespuestaVerificada({
          ...respuestaVerificada,
          [pregunta.id]: 'incompleta'
        })
        return
      }
      irSiguiente()
      return
    }

    // Para tipos con validación, primero verificar que esté completa
    if (!puedeAvanzar()) {
      setRespuestaVerificada({
        ...respuestaVerificada,
        [pregunta.id]: 'incompleta'
      })
      return
    }

    // Para tipos con validación
    const esCorrecta = esRespuestaCorrecta(pregunta)

    if (esCorrecta) {
      setRespuestaVerificada({
        ...respuestaVerificada,
        [pregunta.id]: true
      })
      // Avanzar después de un breve delay
      setTimeout(() => {
        irSiguiente()
      }, 800)
    } else {
      setRespuestaVerificada({
        ...respuestaVerificada,
        [pregunta.id]: 'incorrecta'
      })
    }
  }

  const irSiguiente = async () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1)
    } else {
      // Última pregunta - enviar respuestas al backend
      await manejarEnvioFinal()
    }
  }

  const manejarEnvioFinal = async () => {
    // Evitar envíos duplicados (causados por React StrictMode en desarrollo)
    if (respuestasEnviadas.current) {
      console.log('Las respuestas ya fueron enviadas, evitando duplicado')
      return
    }

    respuestasEnviadas.current = true
    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000)

    try {
      const respuesta = await enviarRespuestas(preguntas, respuestas, tiempoEmpleado)

      if (respuesta) {
        console.log('Respuestas guardadas:', respuesta)
        setMostrarResultados(true)
      }
    } catch (err) {
      console.error('Error al enviar respuestas:', err)
      // Resetear la bandera en caso de error para permitir reintento
      respuestasEnviadas.current = false
      // Aún así mostrar resultados localmente
      setMostrarResultados(true)
    }
  }

  const irAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1)
    }
  }

  const calcularPuntuacion = () => {
    let correctas = 0
    preguntas.forEach(pregunta => {
      if (esRespuestaCorrecta(pregunta) === true) {
        correctas++
      }
    })
    return { correctas, total: preguntas.length }
  }

  const reiniciar = () => {
    setRespuestas({})
    setPreguntaActual(0)
    setMostrarResultados(false)
    setRespuestaVerificada({})
    respuestasEnviadas.current = false // Resetear bandera para permitir nuevo envío
  }

  // Mostrar loading mientras cargan las preguntas
  if (cargandoPreguntas) {
    return (
      <div className='cuestionario'>
        <div className='encabezado-cuestionario'>
          <FaQuestionCircle className='icono-cuestionario' color='#26bc58' />
          <h3 className='titulo-cuestionario'>Evaluación</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando preguntas...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si no se pueden cargar las preguntas
  if (errorPreguntas) {
    return (
      <div className='cuestionario'>
        <div className='encabezado-cuestionario'>
          <FaTimesCircle className='icono-cuestionario' color='#e74c3c' />
          <h3 className='titulo-cuestionario'>Error</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>No se pudieron cargar las preguntas</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{errorPreguntas}</p>
        </div>
      </div>
    )
  }

  // Si no hay preguntas
  if (preguntas.length === 0) {
    return (
      <div className='cuestionario'>
        <div className='encabezado-cuestionario'>
          <FaQuestionCircle className='icono-cuestionario' color='#26bc58' />
          <h3 className='titulo-cuestionario'>Evaluación</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No hay preguntas disponibles para este cuestionario</p>
        </div>
      </div>
    )
  }

  const pregunta = preguntas[preguntaActual]

  if (mostrarResultados) {
    const puntuacion = calcularPuntuacion()
    const porcentaje = (puntuacion.correctas / puntuacion.total) * 100
    const aprobado = porcentaje >= 70

    return (
      <div className='cuestionario'>
        <div className='encabezado-cuestionario'>
          <FaCheckCircle className='icono-cuestionario' color={aprobado ? '#26bc58' : '#e74c3c'} />
          <h3 className='titulo-cuestionario'>Resultados</h3>
        </div>

        <div className='resultado-final'>
          <p className='texto-resultado-grande'>
            {puntuacion.correctas} de {puntuacion.total}
          </p>
          <p className='texto-resultado-porcentaje'>
            {porcentaje.toFixed(0)}% Correcto
          </p>
          <div className='barra-resultado'>
            <div
              className='barra-resultado-relleno'
              style={{
                width: `${porcentaje}%`,
                backgroundColor: aprobado ? '#26bc58' : '#e74c3c'
              }}
            ></div>
          </div>
          {error && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '1rem' }}>
              Error al guardar: {error}
            </p>
          )}

          {/* <button className='boton-reiniciar' onClick={reiniciar} disabled={enviando}>
            {enviando ? 'Guardando...' : 'Intentar de Nuevo'}
          </button> */}
        </div>
      </div>
    )
  }

  return (
    <div className='cuestionario'>
      <div className='encabezado-cuestionario'>
        <FaQuestionCircle className='icono-cuestionario' color='#26bc58' />
        <h3 className='titulo-cuestionario'>Evaluación</h3>
      </div>

      <div className='indicador-progreso'>
        <span className='texto-progreso'>
          Pregunta {preguntaActual + 1} de {preguntas.length}
        </span>
        <div className='puntos-progreso'>
          {preguntas.map((_, index) => (
            <div
              key={index}
              className={`punto ${index === preguntaActual ? 'activo' : ''} ${respuestas[preguntas[index].id] !== undefined ? 'respondida' : ''}`}
            ></div>
          ))}
        </div>
      </div>

      <div className='pregunta-container'>
        <p className='texto-pregunta'>{pregunta.pregunta}</p>

        {pregunta.tipo === 'opcion-multiple' && (
          <div className='opciones'>
            {pregunta.opciones.map(opcion => (
              <button
                key={opcion.id}
                className={`opcion-btn ${respuestas[pregunta.id] === opcion.id ? 'seleccionada' : ''} ${respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === opcion.id ? 'incorrecta' : ''
                  } ${respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === opcion.id ? 'correcta' : ''
                  }`}
                onClick={() => manejarRespuesta(pregunta.id, opcion.id)}
                disabled={respuestaVerificada[pregunta.id] === true}
              >
                <span className='opcion-letra'>{opcion.id.toUpperCase()}</span>
                <span className='opcion-texto'>{opcion.texto}</span>
                {respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === opcion.id && (
                  <FaTimesCircle className='icono-resultado' />
                )}
                {respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === opcion.id && (
                  <FaCheckCircle className='icono-resultado' />
                )}
              </button>
            ))}
          </div>
        )}

        {pregunta.tipo === 'verdadero-falso' && (
          <div className='opciones-vf'>
            <button
              className={`opcion-vf ${respuestas[pregunta.id] === true ? 'seleccionada' : ''} ${respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === true ? 'incorrecta' : ''
                } ${respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === true ? 'correcta' : ''
                }`}
              onClick={() => manejarRespuesta(pregunta.id, true)}
              disabled={respuestaVerificada[pregunta.id] === true}
            >
              Verdadero
              {respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === true && (
                <FaTimesCircle className='icono-resultado' style={{ marginLeft: '0.5rem' }} />
              )}
              {respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === true && (
                <FaCheckCircle className='icono-resultado' style={{ marginLeft: '0.5rem' }} />
              )}
            </button>
            <button
              className={`opcion-vf ${respuestas[pregunta.id] === false ? 'seleccionada' : ''} ${respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === false ? 'incorrecta' : ''
                } ${respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === false ? 'correcta' : ''
                }`}
              onClick={() => manejarRespuesta(pregunta.id, false)}
              disabled={respuestaVerificada[pregunta.id] === true}
            >
              Falso
              {respuestaVerificada[pregunta.id] === 'incorrecta' && respuestas[pregunta.id] === false && (
                <FaTimesCircle className='icono-resultado' style={{ marginLeft: '0.5rem' }} />
              )}
              {respuestaVerificada[pregunta.id] === true && respuestas[pregunta.id] === false && (
                <FaCheckCircle className='icono-resultado' style={{ marginLeft: '0.5rem' }} />
              )}
            </button>
          </div>
        )}

        {/* Opción múltiple con selección múltiple */}
        {pregunta.tipo === 'opcion-multiple-multi' && (
          <div className='opciones'>
            {pregunta.opciones.map(opcion => {
              const seleccionadas = respuestas[pregunta.id] || []
              const estaSeleccionada = seleccionadas.includes(opcion.id)

              return (
                <button
                  key={opcion.id}
                  className={`opcion-btn ${estaSeleccionada ? 'seleccionada' : ''} ${respuestaVerificada[pregunta.id] === 'incorrecta' && estaSeleccionada ? 'incorrecta' : ''
                    } ${respuestaVerificada[pregunta.id] === true && estaSeleccionada ? 'correcta' : ''
                    }`}
                  onClick={() => {
                    const nuevasSelecciones = estaSeleccionada
                      ? seleccionadas.filter(id => id !== opcion.id)
                      : [...seleccionadas, opcion.id]
                    manejarRespuesta(pregunta.id, nuevasSelecciones)
                  }}
                  disabled={respuestaVerificada[pregunta.id] === true}
                >
                  {/* <input
                    type="checkbox"
                    checked={estaSeleccionada}
                    readOnly
                    style={{ marginRight: '0.5rem' }}
                  /> */}
                  <span className='opcion-letra'>{opcion.id.toUpperCase()}</span>
                  <span className='opcion-texto'>{opcion.texto}</span>
                  {respuestaVerificada[pregunta.id] === 'incorrecta' && estaSeleccionada && (
                    <FaTimesCircle className='icono-resultado' />
                  )}
                  {respuestaVerificada[pregunta.id] === true && estaSeleccionada && (
                    <FaCheckCircle className='icono-resultado' />
                  )}
                </button>
              )
            })}
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
              Selecciona todas las opciones correctas
            </small>
          </div>
        )}

        {/* Escala Likert */}
        {pregunta.tipo === 'likert' && (
          <div className='escala-likert'>
            <div className='opciones-likert'>
              {Array.from(
                { length: (pregunta.escala_max || 5) - (pregunta.escala_min || 1) + 1 },
                (_, i) => (pregunta.escala_min || 1) + i
              ).map(valor => (
                <button
                  key={valor}
                  className={`opcion-likert ${respuestas[pregunta.id] === valor ? 'seleccionada' : ''}`}
                  onClick={() => manejarRespuesta(pregunta.id, valor)}
                >
                  {valor}
                </button>
              ))}
            </div>
            <div className='etiquetas-likert-container'>
              {pregunta.etiquetas?.[pregunta.escala_min || 1] && (
                <div className='etiqueta-likert etiqueta-inicio'>
                  {pregunta.etiquetas[pregunta.escala_min || 1]}
                </div>
              )}
              {pregunta.etiquetas?.[pregunta.escala_max || 5] && (
                <div className='etiqueta-likert etiqueta-fin'>
                  {pregunta.etiquetas[pregunta.escala_max || 5]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pregunta abierta */}
        {pregunta.tipo === 'abierta' && (
          <div className='pregunta-abierta'>
            <textarea
              value={respuestas[pregunta.id] || ''}
              onChange={(e) => manejarRespuesta(pregunta.id, e.target.value)}
              placeholder='Escribe tu respuesta aquí...'
              rows={6}
              className='textarea-respuesta'
            />
            {pregunta.longitud_minima && (
              <small className='contador-caracteres'>
                {(respuestas[pregunta.id] || '').length} / {pregunta.longitud_minima} caracteres mínimos
              </small>
            )}
          </div>
        )}

        {respuestaVerificada[pregunta.id] === 'incorrecta' && (
          <div className='mensaje-error'>
            <FaTimesCircle /> Respuesta incorrecta. Intenta nuevamente.
          </div>
        )}

        {respuestaVerificada[pregunta.id] === 'incompleta' && (
          <div className='mensaje-error'>
            <FaTimesCircle />
            {pregunta.tipo === 'abierta' && pregunta.longitud_minima
              ? `Por favor escribe al menos ${pregunta.longitud_minima} caracteres.`
              : 'Por favor completa tu respuesta antes de continuar.'}
          </div>
        )}
      </div>

      <div className='navegacion-botones'>
        <button
          className='boton-navegacion'
          onClick={irAnterior}
          disabled={preguntaActual === 0}
        >
          <FaArrowLeft /> Anterior
        </button>
        <button
          className='boton-navegacion'
          onClick={verificarYAvanzar}
          disabled={respuestas[pregunta.id] === undefined && respuestas[pregunta.id] !== false}
        >
          {preguntaActual === preguntas.length - 1 && respuestaVerificada[pregunta.id] === true
            ? 'Finalizar'
            : 'Enviar'
          } <FaArrowRight />
        </button>
      </div>
    </div>
  )
}

export default Cuestionario
