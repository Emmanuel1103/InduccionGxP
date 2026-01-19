import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaDatabase } from 'react-icons/fa'
import VisorContenedores from '../componets/visorContenedores/VisorContenedores'
import './PaginaDatos.css'
import Header from '../componets/header/header'

const PaginaDatos = () => {
    const location = useLocation()

    return (
        <div className='pagina-datos'>
            <Header />
            <Link to='/configuracion' className='enlace-volver'>
                    <FaArrowLeft /> Volver a Configuración
                </Link>
            <VisorContenedores />
        </div>
    )
}

export default PaginaDatos
