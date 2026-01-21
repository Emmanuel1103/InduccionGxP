import React from 'react'
import ReactPlayer from 'react-player'
import './VideoPlayer.css'
import VideoInduccion from '../../assets/media/induccion_procesos.mp4'

export const VideoPlayer = ({ url }) => {
  return (
    <div className='contenedor-video'>
      <div className='reproductor-wrapper'>
        <ReactPlayer
          src={VideoInduccion || url}
          controls={true}
          width='100%'
          height='100%'
          className='reproductor'
          playing={false}
          muted={true}
          config={{
            youtube: {
              playerVars: {
                showinfo: 1,
                modestbranding: 1
              }
            }
          }}
        />
      </div>
      {/* <p className='texto-video'>Aquí se cargará el video de inducción</p> */}
    </div>
  )
}

export default VideoPlayer
