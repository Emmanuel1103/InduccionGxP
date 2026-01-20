import { useState } from 'react'
import { cuestionariosAPI } from '../servicios/api'

/**
 * Hook personalizado para manejar cuestionarios
 */
export const useCuestionario = (nombre, cuestionarioId, cuestionarioTitulo) => {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)

  /**
   * Convierte las respuestas del componente al formato del backend
   * @param {Array} preguntas - Array de preguntas con su estructura
   * @param {Object} respuestasUsuario - Objeto con las respuestas del usuario
   * @returns {Array} - Array formateado para el backend
   */
  const formatearRespuestas = (preguntas, respuestasUsuario) => {
    return preguntas.map((pregunta, index) => {
      const respuestaUsuario = respuestasUsuario[pregunta.id]
      
      // Determinar respuesta correcta según el tipo
      let respuestaCorrecta
      let esCorrecta = false
      
      if (pregunta.tipo === 'opcion-multiple') {
        const opcionCorrecta = pregunta.opciones.find(op => op.correcta)
        respuestaCorrecta = opcionCorrecta?.texto || ''
        
        const opcionSeleccionada = pregunta.opciones.find(op => op.id === respuestaUsuario)
        esCorrecta = opcionSeleccionada?.correcta || false
      } else if (pregunta.tipo === 'verdadero-falso') {
        respuestaCorrecta = pregunta.respuestaCorrecta ? 'Verdadero' : 'Falso'
        esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta
      }

      return {
        orden: index + 1,
        titulo: `Pregunta ${index + 1}`,
        pregunta: pregunta.pregunta,
        tipo_pregunta: pregunta.tipo === 'opcion-multiple' ? 'multiple_choice' : 'verdadero_falso',
        opciones: pregunta.opciones?.map(op => op.texto) || ['Verdadero', 'Falso'],
        respuesta_correcta: respuestaCorrecta,
        respuesta_usuario: pregunta.tipo === 'opcion-multiple' 
          ? pregunta.opciones.find(op => op.id === respuestaUsuario)?.texto || ''
          : (respuestaUsuario ? 'Verdadero' : 'Falso'),
        es_correcta: esCorrecta
      }
    })
  }

  /**
   * Envía las respuestas del cuestionario al backend
   * @param {Array} preguntas - Preguntas del cuestionario
   * @param {Object} respuestasUsuario - Respuestas del usuario
   * @param {Number} tiempoEmpleado - Tiempo en segundos
   */
  const enviarRespuestas = async (preguntas, respuestasUsuario, tiempoEmpleado = null) => {
    if (!nombre) {
      setError('No hay nombre de usuario')
      return null
    }

    setEnviando(true)
    setError(null)

    try {
      const respuestasFormateadas = formatearRespuestas(preguntas, respuestasUsuario)
      
      const datos = {
        sesion_id: nombre, // Usar nombre como sesion_id para compatibilidad
        nombre: nombre,
        cuestionario_id: cuestionarioId,
        cuestionario_titulo: cuestionarioTitulo,
        respuestas: respuestasFormateadas,
        tiempo_empleado: tiempoEmpleado
      }

      const respuesta = await cuestionariosAPI.guardarRespuestas(datos)
      setResultado(respuesta)
      return respuesta
    } catch (err) {
      setError(err.message)
      console.error('Error al enviar respuestas:', err)
      return null
    } finally {
      setEnviando(false)
    }
  }

  /**
   * Obtiene respuestas anteriores del cuestionario
   */
  const obtenerRespuestasAnteriores = async () => {
    if (!sesionId || !cuestionarioId) return null

    try {
      const respuestas = await cuestionariosAPI.obtenerRespuestaEspecifica(sesionId, cuestionarioId)
      return respuestas
    } catch (err) {
      console.error('Error al obtener respuestas anteriores:', err)
      return null
    }
  }

  return {
    enviarRespuestas,
    obtenerRespuestasAnteriores,
    enviando,
    error,
    resultado
  }
}
