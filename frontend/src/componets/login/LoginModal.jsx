import { useState, useEffect } from 'react'
import { FaMicrosoft, FaTimes } from 'react-icons/fa'
import './LoginModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const LoginModal = ({ isOpen, onClose }) => {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      setCargando(false)
    }
  }, [isOpen])

  const manejarLogin = async () => {
    try {
      setCargando(true)
      setError('')
      
      const response = await fetch(`${API_URL}/auth/login`)
      const data = await response.json()
      
      if (data.auth_url) {
        window.location.href = data.auth_url
      } else {
        setError('Error al obtener URL de autenticación')
        setCargando(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión con el servidor')
      setCargando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <p>Accede con tu cuenta de Microsoft para administrar el sistema</p>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <button 
          onClick={manejarLogin} 
          className="btn-microsoft"
          disabled={cargando}
        >
          <FaMicrosoft />
          {cargando ? 'Redirigiendo...' : 'Iniciar sesión con Microsoft'}
        </button>
      </div>
    </div>
  )
}

export default LoginModal
