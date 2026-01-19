from flask import Blueprint, request, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app
import uuid
from datetime import datetime

bp_cuestionarios = Blueprint('cuestionarios', __name__)

@bp_cuestionarios.route('/respuesta', methods=['POST'])
def guardar_respuesta():
    """Guarda la respuesta de un cuestionario con estructura detallada
    
    Estructura esperada de cada pregunta en 'respuestas':
    {
        "orden": 1,
        "titulo": "Título de la pregunta",
        "pregunta": "Texto completo de la pregunta",
        "tipo_pregunta": "multiple_choice|verdadero_falso|texto_libre",
        "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],  # opcional
        "respuesta_correcta": "Opción B",
        "respuesta_usuario": "Opción A",
        "es_correcta": false
    }
    """
    try:
        datos = request.get_json()
        
        # Validar datos requeridos
        campos_requeridos = ['sesion_id', 'cuestionario_id', 'respuestas']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Validar estructura de respuestas
        if not isinstance(datos['respuestas'], list) or len(datos['respuestas']) == 0:
            return jsonify({'error': 'El campo respuestas debe ser un array con al menos una pregunta'}), 400
        
        # Validar cada pregunta
        for idx, pregunta in enumerate(datos['respuestas']):
            campos_pregunta = ['orden', 'titulo', 'pregunta', 'tipo_pregunta', 'respuesta_correcta', 'respuesta_usuario']
            for campo in campos_pregunta:
                if campo not in pregunta:
                    return jsonify({'error': f'Falta el campo {campo} en la pregunta {idx + 1}'}), 400
        
        # Calcular calificación automática si no se proporciona
        total_preguntas = len(datos['respuestas'])
        respuestas_correctas = sum(1 for p in datos['respuestas'] if p.get('es_correcta', False))
        calificacion_calculada = round((respuestas_correctas / total_preguntas) * 100, 2)
        
        # Crear documento de respuesta
        respuesta = {
            'id': str(uuid.uuid4()),
            'sesion_id': datos['sesion_id'],
            'cuestionario_id': datos['cuestionario_id'],
            'cuestionario_titulo': datos.get('cuestionario_titulo', 'Sin título'),
            'respuestas': datos['respuestas'],  # Array con estructura detallada de cada pregunta
            'calificacion': datos.get('calificacion', calificacion_calculada),
            'total_preguntas': total_preguntas,
            'respuestas_correctas': respuestas_correctas,
            'respuestas_incorrectas': total_preguntas - respuestas_correctas,
            'porcentaje_acierto': calificacion_calculada,
            'aprobado': datos.get('aprobado', calificacion_calculada >= 70),  # 70% como mínimo aprobatorio
            'tiempo_empleado': datos.get('tiempo_empleado'),  # en segundos
            'fecha_completado': datetime.utcnow().isoformat()
        }
        
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        resultado = servicio_cosmos.crear_documento(contenedor_respuestas, respuesta)
        
        if resultado:
            # Actualizar sesión
            contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
            sesion = servicio_cosmos.leer_documento(contenedor_sesiones, datos['sesion_id'], datos['sesion_id'])
            
            if sesion:
                if datos['cuestionario_id'] not in sesion['cuestionarios_completados']:
                    sesion['cuestionarios_completados'].append(datos['cuestionario_id'])
                    sesion['ultima_actividad'] = datetime.utcnow().isoformat()
                    
                    # Incrementar intentos si es el mismo cuestionario
                    sesion['intentos'] = sesion.get('intentos', 1) + 1
                    
                    servicio_cosmos.actualizar_documento(contenedor_sesiones, sesion)
            
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al guardar respuesta'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_cuestionarios.route('/respuestas/<sesion_id>', methods=['GET'])
def obtener_respuestas_sesion(sesion_id):
    """Obtiene todas las respuestas de una sesión"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = "SELECT * FROM c WHERE c.sesion_id = @sesion_id ORDER BY c.fecha_completado DESC"
        parametros = [{"name": "@sesion_id", "value": sesion_id}]
        
        respuestas = servicio_cosmos.consultar_documentos(
            contenedor_respuestas, consulta, parametros
        )
        
        return jsonify(respuestas), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_cuestionarios.route('/respuestas/<sesion_id>/<cuestionario_id>', methods=['GET'])
def obtener_respuesta_especifica(sesion_id, cuestionario_id):
    """Obtiene la respuesta de un cuestionario específico en una sesión"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = """
            SELECT * FROM c 
            WHERE c.sesion_id = @sesion_id 
            AND c.cuestionario_id = @cuestionario_id 
            ORDER BY c.fecha_completado DESC
        """
        parametros = [
            {"name": "@sesion_id", "value": sesion_id},
            {"name": "@cuestionario_id", "value": cuestionario_id}
        ]
        
        respuestas = servicio_cosmos.consultar_documentos(
            contenedor_respuestas, consulta, parametros
        )
        
        if respuestas:
            # Retornar todas las respuestas (permite ver múltiples intentos)
            return jsonify(respuestas), 200
        else:
            return jsonify({'error': 'No se encontraron respuestas'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_cuestionarios.route('/estadisticas/<cuestionario_id>', methods=['GET'])
def obtener_estadisticas_cuestionario(cuestionario_id):
    """Obtiene estadísticas de un cuestionario"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = "SELECT * FROM c WHERE c.cuestionario_id = @cuestionario_id"
        parametros = [{"name": "@cuestionario_id", "value": cuestionario_id}]
        
        respuestas = servicio_cosmos.consultar_documentos(
            contenedor_respuestas, consulta, parametros
        )
        
        # Calcular estadísticas
        total_respuestas = len(respuestas)
        if total_respuestas == 0:
            return jsonify({
                'cuestionario_id': cuestionario_id,
                'total_respuestas': 0,
                'aprobados': 0,
                'reprobados': 0,
                'porcentaje_aprobacion': 0,
                'calificacion_promedio': 0
            }), 200
        
        aprobados = sum(1 for r in respuestas if r.get('aprobado', False))
        calificaciones = [r.get('calificacion', 0) for r in respuestas if r.get('calificacion') is not None]
        calificacion_promedio = sum(calificaciones) / len(calificaciones) if calificaciones else 0
        
        estadisticas = {
            'cuestionario_id': cuestionario_id,
            'total_respuestas': total_respuestas,
            'aprobados': aprobados,
            'reprobados': total_respuestas - aprobados,
            'porcentaje_aprobacion': (aprobados / total_respuestas) * 100,
            'calificacion_promedio': round(calificacion_promedio, 2)
        }
        
        return jsonify(estadisticas), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
