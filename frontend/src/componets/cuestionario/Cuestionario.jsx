import React, { useState } from 'react'
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './Cuestionario.css'

export const Cuestionario = () => {
  const [respuestas, setRespuestas] = useState({})
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [respuestaVerificada, setRespuestaVerificada] = useState({})

  const preguntas = [
    {
      id: 1,
      tipo: 'opcion-multiple',
      pregunta: '¿Qué es la gestión por procesos?',
      opciones: [
        { id: 'a', texto: 'Un modelo de gestión centrado en las actividades', correcta: false },
        { id: 'b', texto: 'Un enfoque que organiza las actividades en procesos interrelacionados', correcta: true },
        { id: 'c', texto: 'Una herramienta de control financiero', correcta: false },

      ]
    },
    {
      id: 2,
      tipo: 'verdadero-falso',
      pregunta: 'La gestión por procesos mejora la eficiencia organizacional',
      respuestaCorrecta: true
    },
    {
      id: 3,
      tipo: 'opcion-multiple',
      pregunta: '¿Cuál es un beneficio de la gestión por procesos?',
      opciones: [
        { id: 'a', texto: 'Mayor burocracia', correcta: false },
        { id: 'b', texto: 'Optimización de recursos', correcta: true },
        { id: 'c', texto: 'Más jerarquías', correcta: false }
      ]
    }
  ]

  const pregunta = preguntas[preguntaActual]

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

    if (pregunta.tipo === 'opcion-multiple') {
      const opcionSeleccionada = pregunta.opciones.find(op => op.id === respuesta)
      return opcionSeleccionada?.correcta
    } else if (pregunta.tipo === 'verdadero-falso') {
      return respuesta === pregunta.respuestaCorrecta
    }
    return null
  }

  const verificarYAvanzar = () => {
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

  const irSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1)
    } else {
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
  }

  if (mostrarResultados) {
    const puntuacion = calcularPuntuacion()
    const porcentaje = (puntuacion.correctas / puntuacion.total) * 100

    return (
      <div className='cuestionario'>
        <div className='encabezado-cuestionario'>
          <FaCheckCircle className='icono-cuestionario' color='#26bc58' />
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
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          <button className='boton-reiniciar' onClick={reiniciar}>
            Intentar de Nuevo
          </button>
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

        {respuestaVerificada[pregunta.id] === 'incorrecta' && (
          <div className='mensaje-error'>
            <FaTimesCircle /> Respuesta incorrecta. Intenta nuevamente.
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
