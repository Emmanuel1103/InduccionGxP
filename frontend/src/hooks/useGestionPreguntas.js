import { useState } from 'react'
import { preguntasAPI } from '../servicios/api'

/**
 * Hook para gestionar operaciones CRUD de preguntas
 */
export const useGestionPreguntas = (cuestionarioId) => {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const obtenerPreguntas = async () => {
    if (!cuestionarioId) return []
    
    setCargando(true)
    setError(null)
    try {
      const preguntas = await preguntasAPI.obtenerPreguntas(cuestionarioId)
      return preguntas
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setCargando(false)
    }
  }

  const crearPregunta = async (datosPregunta) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await preguntasAPI.crearPregunta({
        ...datosPregunta,
        cuestionario_id: cuestionarioId
      })
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const actualizarPregunta = async (preguntaId, datosPregunta) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await preguntasAPI.actualizarPregunta(preguntaId, {
        ...datosPregunta,
        cuestionario_id: cuestionarioId
      })
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const eliminarPregunta = async (preguntaId) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await preguntasAPI.eliminarPregunta(preguntaId, cuestionarioId)
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const inicializarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await preguntasAPI.inicializarDatosEjemplo()
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  return {
    obtenerPreguntas,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    inicializarDatos,
    cargando,
    error
  }
}
