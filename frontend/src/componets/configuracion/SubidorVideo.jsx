import React, { useState } from 'react'
import { FaUpload, FaVideo, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa'
import { videoAPI } from '../../servicios/api'
import './SubidorVideo.css'

export const SubidorVideo = ({ videoUrl, onVideoActualizado }) => {
    const [subiendo, setSubiendo] = useState(false)
    const [progreso, setProgreso] = useState(0)
    const [error, setError] = useState(null)
    const [exito, setExito] = useState(false)

    const handleEliminarVideo = () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar el video? Esta acción no se puede deshacer.')) {
            // Actualizar con URL vacía
            if (onVideoActualizado) {
                onVideoActualizado('')
            }
        }
    }

    const handleFileChange = async (e) => {
        const archivo = e.target.files[0]

        if (!archivo) return

        // Validar tipo de archivo
        const tiposPermitidos = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
        if (!tiposPermitidos.includes(archivo.type)) {
            setError('Formato no permitido. Use MP4, WebM, OGG o MOV')
            return
        }

        // Validar tamaño (500MB)
        const maxSize = 500 * 1024 * 1024
        if (archivo.size > maxSize) {
            setError('El archivo es demasiado grande. Máximo: 500MB')
            return
        }

        try {
            setSubiendo(true)
            setError(null)
            setExito(false)
            setProgreso(0)

            // Simular progreso (ya que fetch no soporta progreso nativo)
            const intervalo = setInterval(() => {
                setProgreso(prev => Math.min(prev + 10, 90))
            }, 500)

            const resultado = await videoAPI.subirVideo(archivo)

            clearInterval(intervalo)
            setProgreso(100)

            if (resultado.video_url) {
                setExito(true)
                setTimeout(() => {
                    if (onVideoActualizado) {
                        onVideoActualizado(resultado.video_url)
                    }
                    setSubiendo(false)
                    setProgreso(0)
                    setExito(false)
                }, 2000)
            }

        } catch (err) {
            setError(err.message || 'Error al subir el video')
            setSubiendo(false)
            setProgreso(0)
        }
    }

    return (
        <div className="subidor-video">
            <div className="video-info">
                <div className="video-icono">
                    <FaVideo />
                </div>
                <div className="video-detalles">
                    <h4>Video de Inducción</h4>
                    {videoUrl ? (
                        <>
                            <p className="video-nombre">
                                <strong>Archivo:</strong> {(() => {
                                    try {
                                        // Extraer solo el nombre del archivo de la URL
                                        const urlObj = new URL(videoUrl)
                                        const pathname = urlObj.pathname
                                        const filename = pathname.split('/').pop()
                                        return decodeURIComponent(filename)
                                    } catch {
                                        return 'archivo de video'
                                    }
                                })()}
                            </p>
                            <p className="video-url-completa">
                                <strong>URL:</strong> {videoUrl}
                            </p>
                        </>
                    ) : (
                        <p className="sin-video">No hay video configurado</p>
                    )}
                </div>
            </div>

            <div className="subidor-acciones">
                <input
                    type="file"
                    id="video-upload"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileChange}
                    disabled={subiendo}
                    style={{ display: 'none' }}
                />
                <label
                    htmlFor="video-upload"
                    className={`btn-subir ${subiendo ? 'disabled' : ''}`}
                >
                    <FaUpload />
                    {subiendo ? 'Subiendo...' : videoUrl ? 'Reemplazar Video' : 'Subir Video'}
                </label>
                {videoUrl && (
                    <button
                        className="btn-eliminar-video"
                        onClick={handleEliminarVideo}
                        disabled={subiendo}
                    >
                        <FaTrash />
                        Eliminar Video
                    </button>
                )}
            </div>

            {subiendo && (
                <div className="progreso-container">
                    <div className="barra-progreso">
                        <div
                            className="barra-progreso-fill"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                    <p className="texto-progreso">{progreso}%</p>
                </div>
            )}

            {error && (
                <div className="mensaje-error">
                    <FaExclamationCircle />
                    <span>{error}</span>
                </div>
            )}

            {exito && (
                <div className="mensaje-exito">
                    <FaCheckCircle />
                    <span>¡Video subido y configuración actualizada!</span>
                </div>
            )}

            <div className="subidor-ayuda">
                <p><strong>Formatos aceptados:</strong> MP4, WebM, OGG, MOV</p>
                <p><strong>Tamaño máximo:</strong> 500MB</p>
            </div>
        </div>
    )
}

export default SubidorVideo
