import { useState, useEffect } from 'react'
import { adminAPI } from '../servicios/api'

/**
 * Hook para obtener datos de administración de los contenedores
 */
export const useAdminDatos = () => {
  const [sesiones, setSesiones] = useState([])
  const [respuestas, setRespuestas] = useState([])
  const [preguntas, setPreguntas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const cargarSesiones = async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await adminAPI.obtenerTodasSesiones()
      setSesiones(datos.sesiones || [])
      return datos
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCargando(false)
    }
  }

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
      const [datosSesiones, datosRespuestas, datosPreguntas, datosEstadisticas] = await Promise.all([
        adminAPI.obtenerTodasSesiones(),
        adminAPI.obtenerTodasRespuestas(),
        adminAPI.obtenerTodasPreguntas(),
        adminAPI.obtenerEstadisticas()
      ])
      
      setSesiones(datosSesiones?.sesiones || [])
      setRespuestas(datosRespuestas?.respuestas || [])
      setPreguntas(datosPreguntas?.preguntas || [])
      setEstadisticas(datosEstadisticas)
      
      return {
        sesiones: datosSesiones,
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

  const vaciarSesiones = async () => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await adminAPI.vaciarSesiones()
      setSesiones([])
      return resultado
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
    sesiones,
    respuestas,
    preguntas,
    estadisticas,
    cargando,
    error,
    cargarSesiones,
    cargarRespuestas,
    cargarPreguntas,
    cargarEstadisticas,
    cargarTodo,
    vaciarSesiones,
    vaciarRespuestas
  }
}
