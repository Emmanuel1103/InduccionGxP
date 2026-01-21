from flask import Blueprint, request, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app
import uuid
from datetime import datetime, timezone, timedelta

bp_preguntas = Blueprint('preguntas', __name__)

def obtener_fecha_colombia():
    """Retorna la fecha y hora actual en zona horaria de Colombia (UTC-5)"""
    return datetime.now(timezone(timedelta(hours=-5))).isoformat()

@bp_preguntas.route('/cuestionario/<cuestionario_id>', methods=['GET'])
def obtener_preguntas_cuestionario(cuestionario_id):
    """Obtiene todas las preguntas de un cuestionario específico"""
    try:
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        consulta = """
            SELECT * FROM c 
            WHERE c.cuestionario_id = @cuestionario_id 
            AND c.activo = true 
            ORDER BY c.orden ASC
        """
        parametros = [{"name": "@cuestionario_id", "value": cuestionario_id}]
        
        preguntas = servicio_cosmos.consultar_documentos(
            contenedor_preguntas, consulta, parametros
        )
        
        return jsonify(preguntas), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_preguntas.route('/cuestionario', methods=['POST'])
def crear_pregunta():
    """Crea una nueva pregunta para un cuestionario
    
    Estructura esperada:
    {
        "cuestionario_id": "cuestionario_gxp_basico",
        "cuestionario_titulo": "Cuestionario Básico de GxP",
        "orden": 1,
        "pregunta": "¿Qué es la gestión por procesos?",
        "tipo": "opcion-multiple",  // o "verdadero-falso"
        "opciones": [
            {"id": "a", "texto": "Opción A", "correcta": false},
            {"id": "b", "texto": "Opción B", "correcta": true}
        ],
        "respuesta_correcta": true,  // para verdadero-falso
        "explicacion": "Texto opcional explicando la respuesta",
        "activo": true
    }
    """
    try:
        datos = request.get_json()
        
        # Validar datos requeridos
        campos_requeridos = ['cuestionario_id', 'pregunta', 'tipo', 'orden']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Validar tipo de pregunta
        tipos_validos = [
            'opcion-multiple',           # Selección única
            'opcion-multiple-multi',     # Selección múltiple
            'verdadero-falso',
            'likert',                    # Escala de valoración
            'abierta'                    # Texto libre (se cuenta como correcta)
        ]
        if datos['tipo'] not in tipos_validos:
            return jsonify({'error': 'Tipo de pregunta inválido'}), 400
        
        # Validar que tenga opciones si es opción múltiple (simple o multi)
        if datos['tipo'] in ['opcion-multiple', 'opcion-multiple-multi'] and 'opciones' not in datos:
            return jsonify({'error': 'Las preguntas de opción múltiple requieren opciones'}), 400
        
        # Validar que tenga respuesta correcta si es verdadero-falso
        if datos['tipo'] == 'verdadero-falso' and 'respuesta_correcta' not in datos:
            return jsonify({'error': 'Las preguntas verdadero-falso requieren respuesta_correcta'}), 400
        
        # Validar configuración de Likert
        if datos['tipo'] == 'likert':
            if 'escala_min' not in datos or 'escala_max' not in datos:
                return jsonify({'error': 'Las preguntas Likert requieren escala_min y escala_max'}), 400
            if datos['escala_min'] >= datos['escala_max']:
                return jsonify({'error': 'escala_min debe ser menor que escala_max'}), 400
        
        # Preguntas abiertas no requieren validaciones adicionales
        
        # Crear ID único usando UUID
        documento_id = f"{datos['cuestionario_id']}_pregunta_{str(uuid.uuid4())}"
        
        # Crear pregunta
        pregunta = {
            'id': documento_id,
            'cuestionario_id': datos['cuestionario_id'],
            'cuestionario_titulo': datos.get('cuestionario_titulo', ''),
            'orden': datos['orden'],
            'pregunta': datos['pregunta'],
            'tipo': datos['tipo'],
            'opciones': datos.get('opciones', []),
            'respuesta_correcta': datos.get('respuesta_correcta'),
            'activo': datos.get('activo', True),

            # Campos para Likert
            'escala_min': datos.get('escala_min'),
            'escala_max': datos.get('escala_max'),
            'etiquetas': datos.get('etiquetas', {}),

            # Campos para preguntas abiertas
            'longitud_minima': datos.get('longitud_minima'),
            
            # Campos para selección múltiple
            'min_selecciones': datos.get('min_selecciones'),
            'max_selecciones': datos.get('max_selecciones'),
            'fecha_creacion': obtener_fecha_colombia(),
            'fecha_modificacion': obtener_fecha_colombia()
        }
        
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        resultado = servicio_cosmos.crear_documento(contenedor_preguntas, pregunta)
        
        if resultado:
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al crear pregunta'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_preguntas.route('/cuestionario/<pregunta_id>', methods=['PUT'])
def actualizar_pregunta(pregunta_id):
    """Actualiza una pregunta existente"""
    try:
        datos = request.get_json()
        cuestionario_id = datos.get('cuestionario_id')
        
        if not cuestionario_id:
            return jsonify({'error': 'Se requiere cuestionario_id'}), 400
        
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        pregunta = servicio_cosmos.leer_documento(contenedor_preguntas, pregunta_id, cuestionario_id)
        
        if not pregunta:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        # Actualizar campos permitidos
        campos_actualizables = ['orden', 'pregunta', 'tipo', 'opciones', 'respuesta_correcta', 
                               'activo', 'cuestionario_titulo', 'escala_min', 
                               'escala_max', 'etiquetas', 'longitud_minima', 'min_selecciones', 
                               'max_selecciones']
        for campo in campos_actualizables:
            if campo in datos:
                pregunta[campo] = datos[campo]
        
        pregunta['fecha_modificacion'] = obtener_fecha_colombia()
        
        resultado = servicio_cosmos.actualizar_documento(contenedor_preguntas, pregunta)
        
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify({'error': 'Error al actualizar pregunta'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_preguntas.route('/cuestionario/<pregunta_id>', methods=['DELETE'])
def eliminar_pregunta(pregunta_id):
    """Elimina físicamente una pregunta del cuestionario"""
    try:
        datos = request.args
        cuestionario_id = datos.get('cuestionario_id')
        
        if not cuestionario_id:
            return jsonify({'error': 'Se requiere parámetro cuestionario_id'}), 400
        
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        
        # Verificar que la pregunta existe antes de eliminar
        pregunta = servicio_cosmos.leer_documento(contenedor_preguntas, pregunta_id, cuestionario_id)
        
        if not pregunta:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        # Eliminar físicamente de la base de datos
        resultado = servicio_cosmos.eliminar_documento(contenedor_preguntas, pregunta_id, cuestionario_id)
        
        if resultado.get('success'):
            return jsonify({'mensaje': 'Pregunta eliminada exitosamente'}), 200
        else:
            return jsonify({'error': resultado.get('message', 'Error al eliminar pregunta')}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_preguntas.route('/cuestionarios', methods=['GET'])
def listar_cuestionarios():
    """Lista todos los cuestionarios disponibles (IDs únicos)"""
    try:
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        consulta = """
            SELECT DISTINCT c.cuestionario_id, c.cuestionario_titulo 
            FROM c 
            WHERE c.activo = true
        """
        
        cuestionarios = servicio_cosmos.consultar_documentos(contenedor_preguntas, consulta)
        
        return jsonify(cuestionarios), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_preguntas.route('/inicializar-datos', methods=['POST'])
def inicializar_datos_ejemplo():
    """Inicializa el contenedor con preguntas de ejemplo (solo para desarrollo)"""
    try:
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        
        preguntas_ejemplo = [
            {
                'id': str(uuid.uuid4()),
                'cuestionario_id': 'cuestionario_gestion_procesos',
                'cuestionario_titulo': 'Evaluación - Gestión por Procesos',
                'orden': 1,
                'pregunta': '¿Qué es la gestión por procesos?',
                'tipo': 'opcion-multiple',
                'opciones': [
                    {'id': 'a', 'texto': 'Un modelo de gestión centrado en las actividades', 'correcta': False},
                    {'id': 'b', 'texto': 'Un enfoque que organiza las actividades en procesos interrelacionados', 'correcta': True},
                    {'id': 'c', 'texto': 'Una herramienta de control financiero', 'correcta': False}
                ],
                'explicacion': 'La gestión por procesos organiza las actividades en procesos interrelacionados para mejorar la eficiencia.',
                'activo': True,
                'fecha_creacion': obtener_fecha_colombia(),
                'fecha_modificacion': obtener_fecha_colombia()
            },
            {
                'id': str(uuid.uuid4()),
                'cuestionario_id': 'cuestionario_gestion_procesos',
                'cuestionario_titulo': 'Evaluación - Gestión por Procesos',
                'orden': 2,
                'pregunta': 'La gestión por procesos mejora la eficiencia organizacional',
                'tipo': 'verdadero-falso',
                'respuesta_correcta': True,
                'explicacion': 'La gestión por procesos efectivamente mejora la eficiencia al optimizar flujos de trabajo.',
                'activo': True,
                'fecha_creacion': obtener_fecha_colombia(),
                'fecha_modificacion': obtener_fecha_colombia()
            },
            {
                'id': str(uuid.uuid4()),
                'cuestionario_id': 'cuestionario_gestion_procesos',
                'cuestionario_titulo': 'Evaluación - Gestión por Procesos',
                'orden': 3,
                'pregunta': '¿Cuál es un beneficio de la gestión por procesos?',
                'tipo': 'opcion-multiple',
                'opciones': [
                    {'id': 'a', 'texto': 'Mayor burocracia', 'correcta': False},
                    {'id': 'b', 'texto': 'Optimización de recursos', 'correcta': True},
                    {'id': 'c', 'texto': 'Más jerarquías', 'correcta': False}
                ],
                'explicacion': 'Uno de los principales beneficios es la optimización de recursos y reducción de desperdicios.',
                'activo': True,
                'fecha_creacion': obtener_fecha_colombia(),
                'fecha_modificacion': obtener_fecha_colombia()
            }
        ]
        
        resultados = []
        for pregunta in preguntas_ejemplo:
            resultado = servicio_cosmos.crear_documento(contenedor_preguntas, pregunta)
            if resultado:
                resultados.append(resultado['id'])
        
        return jsonify({
            'mensaje': f'{len(resultados)} preguntas creadas exitosamente',
            'ids': resultados
        }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
