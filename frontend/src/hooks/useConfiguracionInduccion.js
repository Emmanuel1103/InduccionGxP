import { useState, useEffect } from 'react'
import { configuracionAPI } from '../servicios/api'

export const useConfiguracionInduccion = () => {
    const [configuracion, setConfiguracion] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

    const cargarConfiguracion = async () => {
        try {
            setCargando(true)
            setError(null)
            const datos = await configuracionAPI.obtenerInduccion()
            setConfiguracion(datos)
            return datos
        } catch (err) {
            setError(err.message)
            console.error('Error al cargar configuración:', err)
            return null
        } finally {
            setCargando(false)
        }
    }

    const actualizarConfiguracion = async (datos) => {
        try {
            setCargando(true)
            setError(null)
            const resultado = await configuracionAPI.actualizarInduccion(datos)
            await cargarConfiguracion() // Recargar configuración actualizada
            return { success: true, data: resultado }
        } catch (err) {
            setError(err.message)
            console.error('Error al actualizar configuración:', err)
            return { success: false, error: err.message }
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarConfiguracion()
    }, [])

    return {
        configuracion,
        cargando,
        error,
        cargarConfiguracion,
        actualizarConfiguracion
    }
}
