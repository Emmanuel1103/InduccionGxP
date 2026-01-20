import { useState, useEffect } from 'react'
import { adminAPI } from '../servicios/api'

/**
 * Hook para obtener datos de administración de los contenedores
 */
export const useAdminDatos = () => {
  const [respuestas, setRespuestas] = useState([])
  const [preguntas, setPreguntas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)



  const cargarRespuestas = async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await adminAPI.obtenerTodasRespuestas()
      setRespuestas(datos.respuestas || [])
      return datos
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const cargarPreguntas = async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await adminAPI.obtenerTodasPreguntas()
      setPreguntas(datos.preguntas || [])
      return datos
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const cargarEstadisticas = async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await adminAPI.obtenerEstadisticas()
      setEstadisticas(datos)
      return datos
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  const cargarTodo = async () => {
    setCargando(true)
    setError(null)
    try {
      const [datosRespuestas, datosPreguntas, datosEstadisticas] = await Promise.all([
        adminAPI.obtenerTodasRespuestas(),
        adminAPI.obtenerTodasPreguntas(),
        adminAPI.obtenerEstadisticas()
      ])
      
      setRespuestas(datosRespuestas?.respuestas || [])
      setPreguntas(datosPreguntas?.preguntas || [])
      setEstadisticas(datosEstadisticas)
      
      return {
        respuestas: datosRespuestas,
        preguntas: datosPreguntas,
        estadisticas: datosEstadisticas
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }



  const vaciarRespuestas = async () => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await adminAPI.vaciarRespuestas()
      setRespuestas([])
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

  return {
    respuestas,
    preguntas,
    estadisticas,
    cargando,
    error,
    cargarRespuestas,
    cargarPreguntas,
    cargarEstadisticas,
    cargarTodo,
    vaciarRespuestas
  }
}
