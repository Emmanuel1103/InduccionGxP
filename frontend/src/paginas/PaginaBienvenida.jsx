import React from 'react'
import { useNavigate } from 'react-router-dom'
import Bienvenida from '../componets/bienvenida/bienvenida'
import './PaginaBienvenida.css'

export const PaginaBienvenida = () => {
  const navigate = useNavigate()

  const irAInduccion = () => {
    navigate('/induccion')
  }

  return (
    <div className='pagina-bienvenida'>
      <Bienvenida onComenzar={irAInduccion} />
    </div>
  )
}

export default PaginaBienvenida
