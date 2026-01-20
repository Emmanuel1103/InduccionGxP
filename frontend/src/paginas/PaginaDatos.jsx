import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaDatabase } from 'react-icons/fa'
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
            <div className='mensaje-datos'>
                <h2>Página de Datos</h2>
                <p>El visor de contenedores ha sido eliminado junto con el sistema de sesiones.</p>
                <p>Solo se mantienen las respuestas de cuestionarios en la base de datos.</p>
            </div>
        </div>
    )
}

export default PaginaDatos
