import React, { useState, useEffect } from 'react'
import { FaVideo, FaSave, FaTimes, FaEdit } from 'react-icons/fa'
import { useConfiguracionInduccion } from '../../hooks/useConfiguracionInduccion'
import SubidorVideo from '../configuracion/SubidorVideo'
import '../../estilos/configuracion-comun.css'
import './ConfiguracionInduccion.css'

export const ConfiguracionInduccion = () => {
    const { configuracion, cargando, error, actualizarConfiguracion } = useConfiguracionInduccion()

    const [editando, setEditando] = useState(null) // 'titulo', 'video_url', 'descripcion', o null
    const [valorTemporal, setValorTemporal] = useState('')

    const iniciarEdicion = (campo) => {
        setEditando(campo)
        setValorTemporal(configuracion[campo] || '')
    }

    const cancelarEdicion = () => {
        setEditando(null)
        setValorTemporal('')
    }

    const guardarCampo = async () => {
        // Validar según el campo
        if (editando === 'titulo' && !valorTemporal.trim()) {
            alert('El título no puede estar vacío')
            return
        }

        if (editando === 'descripcion' && !valorTemporal.trim()) {
            alert('La descripción no puede estar vacía')
            return
        }

        // video_url puede estar vacío (opcional)

        const datosActualizados = {
            ...configuracion,
            [editando]: valorTemporal.trim()
        }

        const resultado = await actualizarConfiguracion(datosActualizados)

        if (resultado.success) {
            setEditando(null)
            setValorTemporal('')
        } else {
            alert(`Error: ${resultado.error}`)
        }
    }

    if (cargando && !configuracion) {
        return (
            <div className="gestion-documentos">
                <p className="texto-cargando">Cargando configuración...</p>
            </div>
        )
    }

    return (
        <div className="gestion-documentos">
            <div className="encabezado-gestion">
                <div className="titulo-seccion">
                    <h2>Información de inducción</h2>
                </div>
            </div>

            {error && (
                <div className="mensaje-error">
                    <p>{error}</p>
                </div>
            )}

            <div className="configuracion-grid">
                {/* Sección de Video - Destacada */}
                <div className="config-section-video config-card-full">
                    <div className="config-card-header">
                        <h3> Gestión de Video de Inducción</h3>
                    </div>
                    <SubidorVideo
                        videoUrl={configuracion?.video_url}
                        onVideoActualizado={async (nuevaUrl) => {
                            // Actualizar configuración automáticamente
                            await actualizarConfiguracion({ ...configuracion, video_url: nuevaUrl })
                        }}
                    />
                </div>

                {/* Sección de Información General */}
                <div className="config-section-info config-card-full">
                    {/* Título */}
                    <div className="config-card">
                        <div className="config-card-header">
                            <h3>Título de la Inducción</h3>
                            {editando !== 'titulo' && (
                                <button className="btn-editar-campo" onClick={() => iniciarEdicion('titulo')}>
                                    <FaEdit /> Editar
                                </button>
                            )}
                        </div>

                        {editando === 'titulo' ? (
                            <div className="campo-edicion">
                                <input
                                    type="text"
                                    value={valorTemporal}
                                    onChange={(e) => setValorTemporal(e.target.value)}
                                    placeholder="Título de la inducción"
                                    autoFocus
                                />
                                <div className="botones-campo">
                                    <button className="btn-guardar-campo" onClick={guardarCampo} disabled={cargando}>
                                        <FaSave /> Guardar
                                    </button>
                                    <button className="btn-cancelar-campo" onClick={cancelarEdicion}>
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="campo-valor">
                                <p>{configuracion?.titulo || 'No configurado'}</p>
                                <small>Este título aparece debajo del video en la página principal</small>
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="config-card">
                        <div className="config-card-header">
                            <h3>Descripción de la Sesión</h3>
                            {editando !== 'descripcion' && (
                                <button className="btn-editar-campo" onClick={() => iniciarEdicion('descripcion')}>
                                    <FaEdit /> Editar
                                </button>
                            )}
                        </div>

                        {editando === 'descripcion' ? (
                            <div className="campo-edicion">
                                <textarea
                                    value={valorTemporal}
                                    onChange={(e) => setValorTemporal(e.target.value)}
                                    placeholder="Descripción de la sesión"
                                    rows="5"
                                    autoFocus
                                />
                                <div className="botones-campo">
                                    <button className="btn-guardar-campo" onClick={guardarCampo} disabled={cargando}>
                                        <FaSave /> Guardar
                                    </button>
                                    <button className="btn-cancelar-campo" onClick={cancelarEdicion}>
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="campo-valor">
                                <p>{configuracion?.descripcion || 'No configurado'}</p>
                                <small>Esta descripción aparece en la sección "Sobre esta sesión"</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfiguracionInduccion
