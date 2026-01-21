import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useGestionPreguntas } from '../../hooks/useGestionPreguntas'
import '../../estilos/configuracion-comun.css'
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
      activo: true,
      // Campos para Likert (con valores por defecto)
      escala_min: 1,
      escala_max: 5,
      etiquetas: {},
      // Campos para preguntas abiertas
      longitud_minima: null
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

    // Si es selección única, desmarcar las demás al marcar una
    // Si es selección múltiple, permitir múltiples correctas
    if (campo === 'correcta' && valor === true && preguntaActual.tipo === 'opcion-multiple') {
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
          <p>Haz clic en "Nueva pregunta" para comenzar</p>
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
        Tipo: {{
          'opcion-multiple': 'Opción múltiple (única)',
          'opcion-multiple-multi': 'Opción múltiple (múltiple)',
          'verdadero-falso': 'Verdadero/Falso',
          'likert': 'Escala Likert',
          'abierta': 'Pregunta Abierta'
        }[pregunta.tipo] || pregunta.tipo}
      </span>
      {(pregunta.tipo === 'opcion-multiple' || pregunta.tipo === 'opcion-multiple-multi') && (
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
      {pregunta.tipo === 'likert' && (
        <div className='respuesta-vf'>
          Escala: {pregunta.escala_min} - {pregunta.escala_max}
        </div>
      )}
      {pregunta.tipo === 'abierta' && (
        <div className='respuesta-vf'>
          Pregunta abierta (respuesta libre)
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
        <label>Tipo de pregunta</label>
        <select value={pregunta.tipo} onChange={(e) => onChange('tipo', e.target.value)}>
          <option value='opcion-multiple'>Opción múltiple (selección única)</option>
          <option value='opcion-multiple-multi'>Opción múltiple (selección múltiple)</option>
          <option value='verdadero-falso'>Verdadero/Falso</option>
          <option value='likert'>Escala Likert</option>
          <option value='abierta'>Pregunta abierta</option>
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

      {(pregunta.tipo === 'opcion-multiple' || pregunta.tipo === 'opcion-multiple-multi') ? (
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
      ) : pregunta.tipo === 'verdadero-falso' ? (
        <div className='campo'>
          <label>Respuesta correcta</label>
          <select
            value={pregunta.respuesta_correcta ? 'true' : 'false'}
            onChange={(e) => onChange('respuesta_correcta', e.target.value === 'true')}
          >
            <option value='true'>Verdadero</option>
            <option value='false'>Falso</option>
          </select>
        </div>
      ) : pregunta.tipo === 'likert' ? (
        <>
          <div className='campo'>
            <label>Escala mínima</label>
            <input
              type='number'
              value={pregunta.escala_min || 1}
              onChange={(e) => onChange('escala_min', parseInt(e.target.value))}
              min='1'
            />
          </div>
          <div className='campo'>
            <label>Escala máxima</label>
            <input
              type='number'
              value={pregunta.escala_max || 5}
              onChange={(e) => onChange('escala_max', parseInt(e.target.value))}
              min='2'
            />
          </div>
          <div className='campo'>
            <label>Etiqueta mínima (opcional)</label>
            <input
              type='text'
              value={pregunta.etiquetas?.[pregunta.escala_min] || ''}
              onChange={(e) => onChange('etiquetas', { ...pregunta.etiquetas, [pregunta.escala_min]: e.target.value })}
              placeholder='Ej: Muy en desacuerdo'
            />
          </div>
          <div className='campo'>
            <label>Etiqueta máxima (opcional)</label>
            <input
              type='text'
              value={pregunta.etiquetas?.[pregunta.escala_max] || ''}
              onChange={(e) => onChange('etiquetas', { ...pregunta.etiquetas, [pregunta.escala_max]: e.target.value })}
              placeholder='Ej: Muy de acuerdo'
            />
          </div>
        </>
      ) : pregunta.tipo === 'abierta' ? (
        <div className='campo'>
          <label>Longitud mínima (opcional)</label>
          <input
            type='number'
            value={pregunta.longitud_minima || ''}
            onChange={(e) => onChange('longitud_minima', e.target.value ? parseInt(e.target.value) : null)}
            placeholder='Número mínimo de caracteres'
            min='0'
          />
        </div>
      ) : null}

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
