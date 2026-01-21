import React, { useState, useEffect } from 'react'
import { FaUserShield, FaPlus, FaTrash, FaEnvelope } from 'react-icons/fa'
import '../../estilos/configuracion-comun.css'
import './Administracion.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Administracion = () => {
  const [administradores, setAdministradores] = useState([])
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  useEffect(() => {
    cargarAdministradores()
  }, [])

  const cargarAdministradores = async () => {
    try {
      setCargando(true)
      const response = await fetch(`${API_URL}/auth/administradores`)
      const data = await response.json()

      if (response.ok) {
        setAdministradores(data.administradores || [])
      } else {
        mostrarMensaje('error', 'Error al cargar administradores')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('error', 'Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  const agregarAdministrador = async (e) => {
    e.preventDefault()

    if (!nuevoEmail) {
      mostrarMensaje('error', 'Ingresa un correo electrónico')
      return
    }

    if (!nuevoEmail.endsWith('@fundacionsantodomingo.org')) {
      mostrarMensaje('error', 'Solo se permiten correos @fundacionsantodomingo.org')
      return
    }

    try {
      setCargando(true)
      const response = await fetch(`${API_URL}/auth/administradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: nuevoEmail.toLowerCase().trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        mostrarMensaje('exito', 'Administrador agregado exitosamente')
        setNuevoEmail('')
        cargarAdministradores()
      } else {
        mostrarMensaje('error', data.error || 'Error al agregar administrador')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('error', 'Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  const eliminarAdministrador = async (email) => {
    if (!confirm(`¿Eliminar administrador ${email}?`)) return

    try {
      setCargando(true)
      const response = await fetch(`${API_URL}/auth/administradores/${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        mostrarMensaje('exito', 'Administrador eliminado')
        cargarAdministradores()
      } else {
        const data = await response.json()
        mostrarMensaje('error', data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarMensaje('error', 'Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
  }

  return (
    <div className="administracion-container">
      <div className="administracion-header">
        <h2>Administración de usuarios</h2>
        <p>Gestiona los usuarios con permisos de administrador</p>
      </div>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="agregar-admin-form">
        <h3>Agregar administrador</h3>
        <form onSubmit={agregarAdministrador}>
          <div className="form-group">
            <label>
              <FaEnvelope />
              Correo electrónico
            </label>
            <input
              type="email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              placeholder="usuario@fundacionsantodomingo.org"
              disabled={cargando}
            />
          </div>

          <button type="submit" className="btn-agregar" disabled={cargando}>
            <FaPlus />
            {cargando ? 'Agregando...' : 'Agregar administrador'}
          </button>
        </form>
      </div>

      <div className="lista-administradores">
        <h3>Administradores actuales ({administradores.length})</h3>

        {cargando && administradores.length === 0 ? (
          <div className="cargando">Cargando administradores...</div>
        ) : administradores.length === 0 ? (
          <div className="sin-datos">No hay administradores registrados</div>
        ) : (
          <div className="admin-grid">
            {administradores.map((admin) => (
              <div key={admin.email} className="admin-card">
                <div className="admin-info">
                  <FaUserShield className="admin-icon" />
                  <div className="admin-detalles">
                    <span className="admin-email">{admin.email}</span>
                    <span className="admin-rol">{admin.rol}</span>
                  </div>
                </div>
                <button
                  className="btn-eliminar"
                  onClick={() => eliminarAdministrador(admin.email)}
                  disabled={cargando}
                  title="Eliminar administrador"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Administracion
