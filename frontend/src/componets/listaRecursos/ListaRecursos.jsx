import React, { useState, useEffect } from 'react'
import { FaFolder, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaExternalLinkAlt, FaPaperclip } from 'react-icons/fa'
import { documentosAPI } from '../../servicios/api'
import './ListaRecursos.css'

export const ListaRecursos = () => {
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDocumentos()
  }, [])

  const cargarDocumentos = async () => {
    try {
      setCargando(true)
      const docs = await documentosAPI.listarDocumentos()
      setDocumentos(docs)
      setError(null)
    } catch (err) {
      console.error('Error al cargar documentos:', err)
      setError('No se pudieron cargar los documentos')
    } finally {
      setCargando(false)
    }
  }

  const abrirDocumento = (documento) => {
    // Abrir el link en una nueva pestaña
    window.open(documento.link, '_blank', 'noopener,noreferrer')
  }

  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case 'pdf':
        return <FaFilePdf color="#e74c3c" />
      case 'docx':
        return <FaFileWord color="#2b579a" />
      case 'xlsx':
        return <FaFileExcel color="#217346" />
      case 'pptx':
        return <FaFilePowerpoint color="#d24726" />
      case 'link':
        return <FaExternalLinkAlt color="#3498db" />
      default:
        return <FaPaperclip color="#7f8c8d" />
    }
  }

  if (cargando) {
    return (
      <div className='lista-recursos'>
        <div className='encabezado-recursos'>
          <FaFolder className='icono-recursos' color="#f39c12" />
          <h3 className='titulo-recursos'>Documentos de interés</h3>
        </div>
        <div className='items-recursos'>
          <p style={{ textAlign: 'center', color: '#888', padding: '1rem' }}>
            Cargando documentos...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='lista-recursos'>
        <div className='encabezado-recursos'>
          <FaFolder className='icono-recursos' color="#f39c12" />
          <h3 className='titulo-recursos'>Documentos de interés</h3>
        </div>
        <div className='items-recursos'>
          <p style={{ textAlign: 'center', color: '#e74c3c', padding: '1rem' }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className='lista-recursos'>
        <div className='encabezado-recursos'>
          <FaFolder className='icono-recursos' color="#f39c12" />
          <h3 className='titulo-recursos'>Documentos de interés</h3>
        </div>
        <div className='items-recursos'>
          <p style={{ textAlign: 'center', color: '#888', padding: '1rem' }}>
            No hay documentos disponibles
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='lista-recursos'>
      <div className='encabezado-recursos'>
        <FaFolder className='icono-recursos' color="#f39c12" />
        <h3 className='titulo-recursos'>Documentos de interés</h3>
      </div>
      <div className='items-recursos'>
        {documentos.map(documento => (
          <button
            key={documento.id}
            className='item-recurso item-recurso-clickable'
            onClick={() => abrirDocumento(documento)}
            title={`Abrir: ${documento.nombre}`}
          >
            <div className='info-recurso'>
              <div className='icono-archivo'>{obtenerIcono(documento.tipo)}</div>
              <div className='detalles-recurso'>
                <p className='nombre-recurso'>{documento.nombre}</p>
                {documento.descripcion && (
                  <p className='descripcion-recurso'>{documento.descripcion}</p>
                )}
              </div>
            </div>
            <FaExternalLinkAlt className='icono-abrir' />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ListaRecursos
