import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [esAdministrador, setEsAdministrador] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/usuario-actual`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.autenticado) {
          setUsuario({
            email: data.email,
            nombre: data.nombre
          })
          setEsAdministrador(data.es_administrador)
        }
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error)
    } finally {
      setCargando(false)
    }
  }

  const cerrarSesion = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setUsuario(null)
      setEsAdministrador(false)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      esAdministrador,
      cargando,
      cerrarSesion,
      estaAutenticado: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
