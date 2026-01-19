import { useState, useEffect, useRef } from 'react'
import { sesionesAPI } from '../servicios/api'

/**
 * Hook personalizado para manejar la sesión de inducción
 * Guarda el sesionId en localStorage para persistencia
 */
export const useSesion = () => {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const inicializadoRef = useRef(false)

  // Inicializar o recuperar sesión
  useEffect(() => {
    // Evitar múltiples inicializaciones (especialmente en StrictMode)
    if (inicializadoRef.current) return

    const inicializarSesion = async () => {
      try {
        // Intentar recuperar sesión existente de localStorage
        const sesionIdGuardado = localStorage.getItem('sesion_induccion_id')
        
        if (sesionIdGuardado) {
          // Verificar si la sesión existe en el servidor
          try {
            const sesionExistente = await sesionesAPI.obtener(sesionIdGuardado)
            setSesion(sesionExistente)
            setCargando(false)
            inicializadoRef.current = true
            return
          } catch {
            // Si no existe, crear una nueva
            localStorage.removeItem('sesion_induccion_id')
          }
        }

        // Crear nueva sesión
        const metadata = {
          navegador: navigator.userAgent,
          fecha_local: new Date().toISOString(),
          idioma: navigator.language
        }
        
        const nuevaSesion = await sesionesAPI.crear(metadata)
        localStorage.setItem('sesion_induccion_id', nuevaSesion.sesion_id)
        setSesion(nuevaSesion)
        setCargando(false)
        inicializadoRef.current = true
      } catch (err) {
        setError(err.message)
        setCargando(false)
        inicializadoRef.current = true
      }
    }

    inicializarSesion()
  }, [])

  // Actualizar sesión en el estado local
  const actualizarSesionLocal = (datos) => {
    setSesion(prev => ({ ...prev, ...datos }))
  }

  // Marcar video como visto
  const marcarVideoVisto = async (videoId) => {
    if (!sesion) return
    try {
      const resultado = await sesionesAPI.marcarVideoVisto(sesion.sesion_id, videoId)
      actualizarSesionLocal(resultado)
      return resultado
    } catch (err) {
      console.error('Error al marcar video:', err)
      throw err
    }
  }

  // Completar módulo
  const completarModulo = async (moduloId) => {
    if (!sesion) return
    try {
      const resultado = await sesionesAPI.completarModulo(sesion.sesion_id, moduloId)
      actualizarSesionLocal(resultado)
      return resultado
    } catch (err) {
      console.error('Error al completar módulo:', err)
      throw err
    }
  }

  // Actualizar progreso general
  const actualizarProgreso = async (datos) => {
    if (!sesion) return
    try {
      const resultado = await sesionesAPI.actualizar(sesion.sesion_id, datos)
      actualizarSesionLocal(resultado)
      return resultado
    } catch (err) {
      console.error('Error al actualizar progreso:', err)
      throw err
    }
  }

  // Reiniciar sesión (crear una nueva)
  const reiniciarSesion = () => {
    localStorage.removeItem('sesion_induccion_id')
    window.location.reload()
  }

  return {
    sesion,
    cargando,
    error,
    marcarVideoVisto,
    completarModulo,
    actualizarProgreso,
    reiniciarSesion
  }
}
