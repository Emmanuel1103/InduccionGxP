import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexto/AuthContext'

const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { estaAutenticado, esAdministrador, cargando } = useAuth()

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando...
      </div>
    )
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (soloAdmin && !esAdministrador) {
    return <Navigate to="/bienvenida" replace />
  }

  return children
}

export default RutaProtegida
