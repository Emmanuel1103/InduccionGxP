import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useGestionPreguntas } from '../../hooks/useGestionPreguntas'
import './GestionPreguntas.css'

export const GestionPreguntas = ({ cuestionarioId = 'cuestionario_gestion_procesos' }) => {
  const [preguntas, setPreguntas] = useState([])
  const [modoEdicion, setModoEdicion] = useState(null) // null, 'crear', o ID de pregunta
  const [preguntaActual, setPreguntaActual] = useState(null)
  const { obtenerPreguntas, crearPregunta, actualizarPregunta, eliminarPregunta, inicializarDatos, cargando, error } = useGestionPreguntas(cuestionarioId)

  useEffect(() => {
    cargarPreguntas()
  }, [cuestionarioId])

  const cargarPreguntas = async () => {
    const preguntasCargadas = await obtenerPreguntas()
    setPreguntas(preguntasCargadas.sort((a, b) => a.orden - b.orden))
  }

  const iniciarCreacion = () => {
    setPreguntaActual({
      cuestionario_titulo: 'Evaluación - Gestión por Procesos',
      orden: preguntas.length + 1,
      pregunta: '',
      tipo: 'opcion-multiple',
      opciones: [
        { id: 'a', texto: '', correcta: false },
        { id: 'b', texto: '', correcta: false },
        { id: 'c', texto: '', correcta: false }
      ],
      explicacion: '',
      activo: true
    })
    setModoEdicion('crear')
  }

  const iniciarEdicion = (pregunta) => {
    setPreguntaActual({ ...pregunta })
    setModoEdicion(pregunta.id)
  }

  const cancelar = () => {
    setModoEdicion(null)
    setPreguntaActual(null)
  }

  const guardar = async () => {
    if (!preguntaActual) return

    if (modoEdicion === 'crear') {
      const resultado = await crearPregunta(preguntaActual)
      if (resultado) {
        await cargarPreguntas()
        cancelar()
      }
    } else {
      const resultado = await actualizarPregunta(modoEdicion, preguntaActual)
      if (resultado) {
        await cargarPreguntas()
        cancelar()
      }
    }
  }

  const manejarCambio = (campo, valor) => {
    setPreguntaActual(prev => ({ ...prev, [campo]: valor }))
  }

  const manejarCambioOpcion = (index, campo, valor) => {
    const nuevasOpciones = [...preguntaActual.opciones]
    nuevasOpciones[index] = { ...nuevasOpciones[index], [campo]: valor }
    
    // Si se marca como correcta, desmarcar las demás
    if (campo === 'correcta' && valor === true) {
      nuevasOpciones.forEach((op, i) => {
        if (i !== index) op.correcta = false
      })
    }
    
    setPreguntaActual(prev => ({ ...prev, opciones: nuevasOpciones }))
  }

  const agregarOpcion = () => {
    const nuevaId = String.fromCharCode(97 + preguntaActual.opciones.length) // a, b, c, d...
    setPreguntaActual(prev => ({
      ...prev,
      opciones: [...prev.opciones, { id: nuevaId, texto: '', correcta: false }]
    }))
  }

  const eliminarOpcion = (index) => {
    if (preguntaActual.opciones.length <= 2) return // Mínimo 2 opciones
    setPreguntaActual(prev => ({
      ...prev,
      opciones: prev.opciones.filter((_, i) => i !== index)
    }))
  }

  const manejarInicializarDatos = async () => {
    if (window.confirm('¿Crear preguntas de ejemplo? Esto agregará 3 preguntas predefinidas.')) {
      const resultado = await inicializarDatos()
      if (resultado) {
        await cargarPreguntas()
      }
    }
  }

  const manejarEliminar = async (preguntaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.')) {
      const resultado = await eliminarPregunta(preguntaId)
      if (resultado) {
        await cargarPreguntas()
      }
    }
  }

  const moverPregunta = async (index, direccion) => {
    const nuevasPreguntasArray = [...preguntas]
    const preguntaActual = nuevasPreguntasArray[index]
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1

    if (nuevoIndex < 0 || nuevoIndex >= nuevasPreguntasArray.length) return

    // Intercambiar posiciones
    nuevasPreguntasArray[index] = nuevasPreguntasArray[nuevoIndex]
    nuevasPreguntasArray[nuevoIndex] = preguntaActual

    // Actualizar orden en la base de datos
    const promesas = nuevasPreguntasArray.map((p, idx) => 
      actualizarPregunta(p.id, { ...p, orden: idx + 1 })
    )

    await Promise.all(promesas)
    await cargarPreguntas()
  }

  return (
    <div className='gestion-preguntas'>
      <div className='encabezado-gestion'>
        <h2>Gestión de preguntas</h2>
        <div className='botones-encabezado'>
          <button className='boton-crear' onClick={iniciarCreacion} disabled={modoEdicion !== null}>
            <FaPlus /> Nueva pregunta
          </button>
        </div>
      </div>

      {error && (
        <div className='mensaje-error'>
          Error: {error}
        </div>
      )}

      {cargando && <div className='mensaje-cargando'>Cargando...</div>}

      {/* Lista de preguntas */}
      <div className='lista-preguntas'>
        {preguntas.map((pregunta, index) => (
          <div key={pregunta.id} className={`tarjeta-pregunta ${modoEdicion === pregunta.id ? 'editando' : ''}`}>
            {modoEdicion === pregunta.id ? (
              <FormularioPregunta
                pregunta={preguntaActual}
                onChange={manejarCambio}
                onChangeOpcion={manejarCambioOpcion}
                onAgregarOpcion={agregarOpcion}
                onEliminarOpcion={eliminarOpcion}
                onGuardar={guardar}
                onCancelar={cancelar}
                cargando={cargando}
              />
            ) : (
              <VistaPregunta 
                pregunta={pregunta} 
                index={index}
                totalPreguntas={preguntas.length}
                onEditar={() => iniciarEdicion(pregunta)}
                onEliminar={() => manejarEliminar(pregunta.id)}
                onMoverArriba={() => moverPregunta(index, 'arriba')}
                onMoverAbajo={() => moverPregunta(index, 'abajo')}
              />
            )}
          </div>
        ))}

        {/* Formulario de creación */}
        {modoEdicion === 'crear' && (
          <div className='tarjeta-pregunta editando nueva'>
            <h3>Nueva pregunta</h3>
            <FormularioPregunta
              pregunta={preguntaActual}
              onChange={manejarCambio}
              onChangeOpcion={manejarCambioOpcion}
              onAgregarOpcion={agregarOpcion}
              onEliminarOpcion={eliminarOpcion}
              onGuardar={guardar}
              onCancelar={cancelar}
              cargando={cargando}
            />
          </div>
        )}
      </div>

      {preguntas.length === 0 && !modoEdicion && !cargando && (
        <div className='mensaje-vacio'>
          <p>No hay preguntas configuradas</p>
          <p>Haz clic en "Cargar Datos de Ejemplo" o "Nueva pregunta" para comenzar</p>
        </div>
      )}
    </div>
  )
}

const VistaPregunta = ({ pregunta, index, totalPreguntas, onEditar, onEliminar, onMoverArriba, onMoverAbajo }) => {
  return (
    <>
      <div className='cabecera-pregunta'>
        <div className='info-orden'>
          <span className='orden-pregunta'>Pregunta #{pregunta.orden}</span>
          <div className='controles-orden'>
            <button 
              className='boton-orden' 
              onClick={onMoverArriba} 
              disabled={index === 0}
              title='Mover arriba'
            >
              <FaArrowUp />
            </button>
            <button 
              className='boton-orden' 
              onClick={onMoverAbajo} 
              disabled={index === totalPreguntas - 1}
              title='Mover abajo'
            >
              <FaArrowDown />
            </button>
          </div>
        </div>
        <div className='botones-accion'>
          <button className='boton-editar' onClick={onEditar} title='Editar pregunta'>
            <FaEdit /> Editar
          </button>
          <button className='boton-eliminar' onClick={onEliminar} title='Eliminar pregunta'>
            <FaTrash />
          </button>
        </div>
      </div>
      <p className='texto-pregunta'>{pregunta.pregunta}</p>
      <span className='tipo-pregunta'>
        Tipo: {pregunta.tipo === 'opcion-multiple' ? 'Opción múltiple' : 'Verdadero/Falso'}
      </span>
      {pregunta.tipo === 'opcion-multiple' && (
        <div className='opciones-vista'>
          {pregunta.opciones.map((opcion) => (
            <div key={opcion.id} className={`opcion-vista ${opcion.correcta ? 'correcta' : ''}`}>
              {opcion.id.toUpperCase()}. {opcion.texto}
              {opcion.correcta && ' ✓'}
            </div>
          ))}
        </div>
      )}
      {pregunta.tipo === 'verdadero-falso' && (
        <div className='respuesta-vf'>
          Respuesta correcta: <strong>{pregunta.respuesta_correcta ? 'Verdadero' : 'Falso'}</strong>
        </div>
      )}
      {pregunta.explicacion && (
        <div className='explicacion'>
          <small>Explicación: {pregunta.explicacion}</small>
        </div>
      )}
    </>
  )
}

const FormularioPregunta = ({
  pregunta,
  onChange,
  onChangeOpcion,
  onAgregarOpcion,
  onEliminarOpcion,
  onGuardar,
  onCancelar,
  cargando
}) => {
  return (
    <div className='formulario-pregunta'>
      <div className='campo'>
        <label>Orden</label>
        <input
          type='number'
          value={pregunta.orden}
          onChange={(e) => onChange('orden', parseInt(e.target.value))}
          min='1'
        />
      </div>

      <div className='campo'>
        <label>Tipo de Pregunta</label>
        <select value={pregunta.tipo} onChange={(e) => onChange('tipo', e.target.value)}>
          <option value='opcion-multiple'>Opción múltiple</option>
          <option value='verdadero-falso'>Verdadero/Falso</option>
        </select>
      </div>

      <div className='campo'>
        <label>Pregunta</label>
        <textarea
          value={pregunta.pregunta}
          onChange={(e) => onChange('pregunta', e.target.value)}
          rows='3'
          placeholder='Escribe aquí la pregunta...'
        />
      </div>

      {pregunta.tipo === 'opcion-multiple' ? (
        <div className='campo'>
          <label>Opciones</label>
          <div className='opciones-formulario'>
            {pregunta.opciones.map((opcion, index) => (
              <div key={index} className='opcion-item'>
                <span className='opcion-letra'>{opcion.id.toUpperCase()}</span>
                <input
                  type='text'
                  value={opcion.texto}
                  onChange={(e) => onChangeOpcion(index, 'texto', e.target.value)}
                  placeholder='Texto de la opción'
                />
                <label className='checkbox-correcta'>
                  <input
                    type='checkbox'
                    checked={opcion.correcta}
                    onChange={(e) => onChangeOpcion(index, 'correcta', e.target.checked)}
                  />
                  Correcta
                </label>
                {pregunta.opciones.length > 2 && (
                  <button
                    type='button'
                    className='boton-eliminar-opcion'
                    onClick={() => onEliminarOpcion(index)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type='button' className='boton-agregar-opcion' onClick={onAgregarOpcion}>
            <FaPlus /> Agregar Opción
          </button>
        </div>
      ) : (
        <div className='campo'>
          <label>Respuesta Correcta</label>
          <select
            value={pregunta.respuesta_correcta ? 'true' : 'false'}
            onChange={(e) => onChange('respuesta_correcta', e.target.value === 'true')}
          >
            <option value='true'>Verdadero</option>
            <option value='false'>Falso</option>
          </select>
        </div>
      )}

      <div className='campo'>
        <label>Explicación (opcional)</label>
        <textarea
          value={pregunta.explicacion}
          onChange={(e) => onChange('explicacion', e.target.value)}
          rows='2'
          placeholder='Explicación de por qué es correcta esta respuesta...'
        />
      </div>

      <div className='botones-formulario'>
        <button className='boton-guardar' onClick={onGuardar} disabled={cargando}>
          <FaSave /> {cargando ? 'Guardando...' : 'Guardar'}
        </button>
        <button className='boton-cancelar' onClick={onCancelar} disabled={cargando}>
          <FaTimes /> Cancelar
        </button>
      </div>
    </div>
  )
}

export default GestionPreguntas
