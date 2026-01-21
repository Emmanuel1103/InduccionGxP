import { useState, useEffect } from 'react'
import { documentosAPI } from '../servicios/api'

export const useDocumentos = () => {
    const [documentos, setDocumentos] = useState([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

    const cargarDocumentos = async () => {
        try {
            setCargando(true)
            setError(null)
            const docs = await documentosAPI.listarTodosDocumentos()
            setDocumentos(docs)
            return docs
        } catch (err) {
            setError(err.message)
            console.error('Error al cargar documentos:', err)
            return []
        } finally {
            setCargando(false)
        }
    }

    const crearDocumento = async (datos) => {
        try {
            setCargando(true)
            setError(null)
            const nuevoDoc = await documentosAPI.crearDocumento(datos)
            await cargarDocumentos() // Recargar lista
            return { success: true, data: nuevoDoc }
        } catch (err) {
            setError(err.message)
            console.error('Error al crear documento:', err)
            return { success: false, error: err.message }
        } finally {
            setCargando(false)
        }
    }

    const actualizarDocumento = async (id, datos) => {
        try {
            setCargando(true)
            setError(null)
            const docActualizado = await documentosAPI.actualizarDocumento(id, datos)
            await cargarDocumentos() // Recargar lista
            return { success: true, data: docActualizado }
        } catch (err) {
            setError(err.message)
            console.error('Error al actualizar documento:', err)
            return { success: false, error: err.message }
        } finally {
            setCargando(false)
        }
    }

    const eliminarDocumento = async (id) => {
        try {
            setCargando(true)
            setError(null)
            await documentosAPI.eliminarDocumento(id)
            await cargarDocumentos() // Recargar lista
            return { success: true }
        } catch (err) {
            setError(err.message)
            console.error('Error al eliminar documento:', err)
            return { success: false, error: err.message }
        } finally {
            setCargando(false)
        }
    }

    const reordenarDocumentos = async (orden) => {
        try {
            setError(null)
            await documentosAPI.reordenarDocumentos(orden)
            return { success: true }
        } catch (err) {
            setError(err.message)
            console.error('Error al reordenar documentos:', err)
            throw err // Lanzar error para que el componente lo maneje
        }
    }

    useEffect(() => {
        cargarDocumentos()
    }, [])

    return {
        documentos,
        setDocumentos, // Exportar para actualizaciones optimistas
        cargando,
        error,
        cargarDocumentos,
        crearDocumento,
        actualizarDocumento,
        eliminarDocumento,
        reordenarDocumentos
    }
}
