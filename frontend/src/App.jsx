import React from 'react'
import Header from './componets/header/header'
import Cuerpo from './componets/cuerpo/cuerpo'  

export const App = () => {
  return (
    <div className='contenedor'>
      <Header/>
      <Cuerpo/> 
    </div>
  )
}

export default App
