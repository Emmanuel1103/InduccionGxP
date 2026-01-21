import React, { useState } from 'react'
import { FaFolder, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaExternalLinkAlt, FaPaperclip, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useDocumentos } from '../../hooks/useDocumentos'
import '../../estilos/configuracion-comun.css'
import './GestionDocumentos.css'

export const GestionDocumentos = () => {
    const { documentos, setDocumentos, cargando, error, crearDocumento, actualizarDocumento, eliminarDocumento, reordenarDocumentos } = useDocumentos()

    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null)
    const [formulario, setFormulario] = useState({
        nombre: '',
        url: '',
        tipo: 'pdf',
        descripcion: '',
        activo: true
    })

    const tiposDocumento = [
        { value: 'pdf', label: 'PDF', icon: FaFilePdf, color: '#e74c3c' },
        { value: 'docx', label: 'Word', icon: FaFileWord, color: '#2b579a' },
        { value: 'xlsx', label: 'Excel', icon: FaFileExcel, color: '#217346' },
        { value: 'pptx', label: 'PowerPoint', icon: FaFilePowerpoint, color: '#d24726' },
        { value: 'otro', label: 'Otro', icon: FaPaperclip, color: '#7f8c8d' }
    ]

    const limpiarFormulario = () => {
        setFormulario({
            nombre: '',
            url: '',
            tipo: 'pdf',
            descripcion: '',
            activo: true
        })
        setEditando(null)
        setMostrarFormulario(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formulario.nombre.trim() || !formulario.url.trim()) {
            alert('Por favor completa los campos requeridos')
            return
        }

        let resultado
        if (editando) {
            resultado = await actualizarDocumento(editando, formulario)
        } else {
            resultado = await crearDocumento(formulario)
        }

        if (resultado.success) {
            limpiarFormulario()
        } else {
            alert(`Error: ${resultado.error}`)
        }
    }

    const handleEditar = (documento) => {
        setFormulario({
            nombre: documento.nombre || '',
            url: documento.url || documento.link || '',  // Compatibilidad con datos viejos
            tipo: documento.tipo || 'pdf',
            descripcion: documento.descripcion || '',
            activo: documento.activo !== undefined ? documento.activo : true
        })
        setEditando(documento.id)
        setMostrarFormulario(true)
    }

    const handleEliminar = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
            const resultado = await eliminarDocumento(id)
            if (!resultado.success) {
                alert(`Error: ${resultado.error}`)
            }
        }
    }

    const handleMoverArriba = async (index) => {
        if (index === 0) return // Ya está en la primera posición

        // Actualización optimista: actualizar UI inmediatamente
        const nuevosDocumentos = [...documentos]
        const temp = nuevosDocumentos[index]
        nuevosDocumentos[index] = nuevosDocumentos[index - 1]
        nuevosDocumentos[index - 1] = temp

        // Actualizar UI de inmediato
        setDocumentos(nuevosDocumentos)

        // Guardar en backend en segundo plano
        const nuevoOrden = nuevosDocumentos.map(doc => doc.id)
        reordenarDocumentos(nuevoOrden).catch(() => {
            // Si falla, revertir cambios
            setDocumentos(documentos)
            alert('Error al reordenar. Intenta de nuevo.')
        })
    }

    const handleMoverAbajo = async (index) => {
        if (index === documentos.length - 1) return // Ya está en la última posición

        // Actualización optimista: actualizar UI inmediatamente
        const nuevosDocumentos = [...documentos]
        const temp = nuevosDocumentos[index]
        nuevosDocumentos[index] = nuevosDocumentos[index + 1]
        nuevosDocumentos[index + 1] = temp

        // Actualizar UI de inmediato
        setDocumentos(nuevosDocumentos)

        // Guardar en backend en segundo plano
        const nuevoOrden = nuevosDocumentos.map(doc => doc.id)
        reordenarDocumentos(nuevoOrden).catch(() => {
            // Si falla, revertir cambios
            setDocumentos(documentos)
            alert('Error al reordenar. Intenta de nuevo.')
        })
    }

    const obtenerIconoTipo = (tipo) => {
        const tipoInfo = tiposDocumento.find(t => t.value === tipo)
        if (!tipoInfo) return <FaPaperclip />
        const IconComponent = tipoInfo.icon
        return <IconComponent color={tipoInfo.color} />
    }

    return (
        <div className="gestion-documentos">
            <div className="encabezado-gestion">
                <div className="titulo-seccion">
                    <h2>Gestión de documentos</h2>
                </div>
                <button
                    className="btn-nuevo"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    {mostrarFormulario ? <FaTimes /> : <FaPlus />}
                    {mostrarFormulario ? 'Cancelar' : 'Nuevo Documento'}
                </button>
            </div>

            {error && (
                <div className="mensaje-error">
                    <p>{error}</p>
                </div>
            )}

            {mostrarFormulario && (
                <div className="formulario-documento">
                    <h3>{editando ? 'Editar Documento' : 'Nuevo Documento'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del documento *</label>
                            <input
                                type="text"
                                id="nombre"
                                value={formulario.nombre}
                                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                                placeholder="Ej: Manual de gestión por procesos"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="url">Link / URL *</label>
                            <input
                                type="text"
                                id="url"
                                value={formulario.url}
                                onChange={(e) => setFormulario({ ...formulario, url: e.target.value })}
                                placeholder="Ej: https://ejemplo.com/documento.pdf"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tipo">Tipo de archivo *</label>
                            <div className="selector-tipo">
                                {tiposDocumento.map(tipo => {
                                    const IconComponent = tipo.icon
                                    return (
                                        <button
                                            key={tipo.value}
                                            type="button"
                                            className={`tipo-btn ${formulario.tipo === tipo.value ? 'activo' : ''}`}
                                            onClick={() => setFormulario({ ...formulario, tipo: tipo.value })}
                                        >
                                            <IconComponent color={tipo.color} />
                                            <span>{tipo.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción (opcional)</label>
                            <textarea
                                id="descripcion"
                                value={formulario.descripcion}
                                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                                placeholder="Descripción breve del documento"
                                rows="3"
                            />
                        </div>

                        <div className="form-group-checkbox">
                            <input
                                type="checkbox"
                                id="activo"
                                checked={formulario.activo}
                                onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                            />
                            <label htmlFor="activo">Documento activo (visible para usuarios)</label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-guardar" disabled={cargando}>
                                <FaSave />
                                {editando ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
                                <FaTimes />
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="lista-documentos">
                <h3>Documentos ({documentos.length})</h3>

                {cargando && <p className="texto-cargando">Cargando...</p>}

                {!cargando && documentos.length === 0 && (
                    <p className="texto-vacio">No hay documentos. Crea uno nuevo para comenzar.</p>
                )}

                {!cargando && documentos.length > 0 && (
                    <div className="tabla-documentos">
                        {documentos.map((doc, index) => (
                            <div key={doc.id} className={`documento-item ${!doc.activo ? 'inactivo' : ''}`}>
                                <div className="documento-orden">
                                    <button
                                        className="btn-orden"
                                        onClick={() => handleMoverArriba(index)}
                                        disabled={index === 0}
                                        title="Mover arriba"
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <span className="numero-orden">{index + 1}</span>
                                    <button
                                        className="btn-orden"
                                        onClick={() => handleMoverAbajo(index)}
                                        disabled={index === documentos.length - 1}
                                        title="Mover abajo"
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>
                                <div className="documento-info">
                                    <div className="documento-icono">
                                        {obtenerIconoTipo(doc.tipo)}
                                    </div>
                                    <div className="documento-detalles">
                                        <h4>{doc.nombre}</h4>
                                        {doc.descripcion && <p className="descripcion">{doc.descripcion}</p>}
                                        <p className="link">{doc.url || doc.link}</p>
                                        <div className="documento-meta">
                                            <span className={`badge ${doc.activo ? 'activo' : 'inactivo'}`}>
                                                {doc.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <span className="tipo">{tiposDocumento.find(t => t.value === doc.tipo)?.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="documento-acciones">
                                    <button
                                        className="btn-accion editar"
                                        onClick={() => handleEditar(doc)}
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn-accion eliminar"
                                        onClick={() => handleEliminar(doc.id, doc.nombre)}
                                        title="Eliminar"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default GestionDocumentos
