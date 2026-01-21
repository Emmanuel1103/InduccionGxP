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
      let respuestaUsuarioTexto
      let esCorrecta = false
      let tipoPregunta = 'multiple_choice'
      let opciones = []

      switch (pregunta.tipo) {
        case 'opcion-multiple':
          const opcionCorrecta = pregunta.opciones.find(op => op.correcta)
          respuestaCorrecta = opcionCorrecta?.texto || ''
          const opcionSeleccionada = pregunta.opciones.find(op => op.id === respuestaUsuario)
          respuestaUsuarioTexto = opcionSeleccionada?.texto || ''
          esCorrecta = opcionSeleccionada?.correcta || false
          opciones = pregunta.opciones?.map(op => op.texto) || []
          tipoPregunta = 'multiple_choice'
          break

        case 'opcion-multiple-multi':
          const opcionesCorrectas = pregunta.opciones.filter(op => op.correcta)
          respuestaCorrecta = opcionesCorrectas.map(op => op.texto).join(', ')
          const seleccionadas = Array.isArray(respuestaUsuario) ? respuestaUsuario : []
          const opcionesSeleccionadas = pregunta.opciones.filter(op => seleccionadas.includes(op.id))
          respuestaUsuarioTexto = opcionesSeleccionadas.map(op => op.texto).join(', ')
          // Verificar si todas las correctas están seleccionadas
          const correctasIds = opcionesCorrectas.map(op => op.id)
          esCorrecta = seleccionadas.length === correctasIds.length &&
            seleccionadas.every(id => correctasIds.includes(id))
          opciones = pregunta.opciones?.map(op => op.texto) || []
          tipoPregunta = 'multiple_choice_multi'
          break

        case 'verdadero-falso':
          respuestaCorrecta = pregunta.respuestaCorrecta ? 'Verdadero' : 'Falso'
          respuestaUsuarioTexto = respuestaUsuario ? 'Verdadero' : 'Falso'
          esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta
          opciones = ['Verdadero', 'Falso']
          tipoPregunta = 'verdadero_falso'
          break

        case 'likert':
          respuestaCorrecta = 'N/A' // No hay respuesta correcta
          respuestaUsuarioTexto = String(respuestaUsuario || '')
          esCorrecta = true // Siempre correcta
          opciones = Array.from(
            { length: pregunta.escala_max - pregunta.escala_min + 1 },
            (_, i) => String(pregunta.escala_min + i)
          )
          tipoPregunta = 'likert'
          break

        case 'abierta':
          respuestaCorrecta = 'N/A' // No hay respuesta correcta
          respuestaUsuarioTexto = String(respuestaUsuario || '')
          esCorrecta = true // Siempre correcta
          opciones = []
          tipoPregunta = 'texto_libre'
          break

        default:
          respuestaCorrecta = ''
          respuestaUsuarioTexto = ''
          esCorrecta = false
      }

      return {
        orden: index + 1,
        titulo: `Pregunta ${index + 1}`,
        pregunta: pregunta.pregunta,
        tipo_pregunta: tipoPregunta,
        opciones: opciones,
        respuesta_correcta: respuestaCorrecta,
        respuesta_usuario: respuestaUsuarioTexto,
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
