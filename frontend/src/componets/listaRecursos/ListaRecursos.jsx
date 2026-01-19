import React from 'react'
import { FaFolder, FaFilePdf, FaFileWord, FaPaperclip, FaDownload } from 'react-icons/fa'
import './ListaRecursos.css'

export const ListaRecursos = ({ recursos = [] }) => {
  const recursosEjemplo = recursos.length > 0 ? recursos : [
    { id: 1, nombre: 'GP-PL-01-V4 Política Gestión por procesos.pdf', tamano: '--', tipo: 'pdf', archivo: '/archivos/GP-PL-01-V4 Política Gestión por procesos.pdf' },
    { id: 2, nombre: 'GP-MA-01-V2 Manual de gestión por procesos.pdf', tamano: '--', tipo: 'pdf', archivo: '/archivos/GP-MA-01-V2 Manual de gestión por procesos.pdf' },
    // { id: 2, nombre: 'Politica_privacidad.docx', tamano: '1.1 MB', tipo: 'docx' }
  ]

  const descargarArchivo = (recurso) => {
    if (!recurso.archivo) {
      console.error('No hay archivo disponible para descargar')
      return
    }

    // Crear un enlace temporal y hacer clic en él
    const link = document.createElement('a')
    link.href = recurso.archivo
    link.download = recurso.nombre
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case 'pdf':
        return <FaFilePdf color="#e74c3c" />
      case 'docx':
        return <FaFileWord color="#2b579a" />
      default:
        return <FaPaperclip color="#7f8c8d" />
    }
  }

  return (
    <div className='lista-recursos'>
      <div className='encabezado-recursos'>
        <FaFolder className='icono-recursos' color="#f39c12" />
        <h3 className='titulo-recursos'>Documentos de interés</h3>
      </div>
      <div className='items-recursos'>
        {recursosEjemplo.map(recurso => (
          <div key={recurso.id} className='item-recurso'>
            <div className='info-recurso'>
              <div className='icono-archivo'>{obtenerIcono(recurso.tipo)}</div>
              <div className='detalles-recurso'>
                <p className='nombre-recurso'>{recurso.nombre}</p>
                <p className='tamano-recurso'>{recurso.tamano}</p>
              </div>
            </div>
            <button className='boton-descargar' title='Descargar' onClick={() => descargarArchivo(recurso)}>
              <FaDownload />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListaRecursos
