import { createContext, useContext, useMemo } from 'react'
import { useSesion } from '../hooks/useSesion'

export const SesionContext = createContext(null)

export const SesionProvider = ({ children }) => {
  const sesionData = useSesion()

  // Memorizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => sesionData, [
    sesionData.sesion,
    sesionData.cargando,
    sesionData.error
  ])

  return (
    <SesionContext.Provider value={value}>
      {children}
    </SesionContext.Provider>
  )
}

export const useSesionContext = () => {
  const context = useContext(SesionContext)
  if (!context) {
    throw new Error('useSesionContext debe usarse dentro de SesionProvider')
  }
  return context
}
