import { useState, useEffect } from 'react'
import { FaMicrosoft } from 'react-icons/fa'
import './Login.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = () => {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Verificar si hay error en la URL
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
    }
  }, [])

  const manejarLogin = async () => {
    try {
      setCargando(true)
      setError('')
      
      // Solicitar URL de autenticación al backend
      const response = await fetch(`${API_URL}/auth/login`)
      const data = await response.json()
      
      if (data.auth_url) {
        // Redirigir a Microsoft para autenticación
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bienvenido al sistema de inducción</h1>
          <p>Inicia sesión con tu cuenta de Microsoft</p>
        </div>

        {error && (
          <div className="login-error">
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

        <div className="login-footer">
          <p>Sistema de gestión por procesos</p>
        </div>
      </div>
    </div>
  )
}

export default Login
