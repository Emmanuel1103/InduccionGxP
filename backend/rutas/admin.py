from flask import Blueprint, jsonify, request, current_app
from servicios.cosmos_db import servicio_cosmos
import traceback

bp_admin = Blueprint('admin', __name__)

@bp_admin.route('/sesiones/todas', methods=['GET'])
def listar_todas_sesiones():
    """Lista todas las sesiones creadas"""
    try:
        return jsonify({'error': 'Contenedor de sesiones eliminado'}), 410
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/respuestas/todas', methods=['GET'])
def listar_todas_respuestas():
    """Lista todas las respuestas guardadas"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = "SELECT * FROM c ORDER BY c.fecha_completado DESC"
        
        respuestas = servicio_cosmos.consultar_documentos(contenedor_respuestas, consulta)
        
        return jsonify({
            'total': len(respuestas),
            'respuestas': respuestas
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/preguntas/todas', methods=['GET'])
def listar_todas_preguntas():
    """Lista todas las preguntas configuradas"""
    try:
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        consulta = "SELECT * FROM c ORDER BY c.cuestionario_id, c.orden ASC"
        
        preguntas = servicio_cosmos.consultar_documentos(contenedor_preguntas, consulta)
        
        # Agrupar por cuestionario
        cuestionarios = {}
        for pregunta in preguntas:
            cuestionario_id = pregunta.get('cuestionario_id', 'sin_cuestionario')
            if cuestionario_id not in cuestionarios:
                cuestionarios[cuestionario_id] = []
            cuestionarios[cuestionario_id].append(pregunta)
        
        return jsonify({
            'total': len(preguntas),
            'cuestionarios': cuestionarios,
            'preguntas': preguntas
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/estadisticas', methods=['GET'])
def obtener_estadisticas_generales():
    """Obtiene estadísticas generales del sistema"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        
        # Contar respuestas
        respuestas = servicio_cosmos.consultar_documentos(contenedor_respuestas, "SELECT * FROM c")
        total_respuestas = len(respuestas)
        
        # Contar preguntas activas
        preguntas = servicio_cosmos.consultar_documentos(
            contenedor_preguntas, 
            "SELECT * FROM c WHERE c.activo = true"
        )
        total_preguntas_activas = len(preguntas)
        
        # Calcular calificación promedio
        if respuestas:
            calificaciones = [r.get('calificacion', 0) for r in respuestas if 'calificacion' in r]
            promedio_calificacion = sum(calificaciones) / len(calificaciones) if calificaciones else 0
        else:
            promedio_calificacion = 0
        
        # Contar aprobados
        aprobados = sum(1 for r in respuestas if r.get('calificacion', 0) >= 70)
        
        return jsonify({
            'respuestas': {
                'total': total_respuestas,
                'aprobados': aprobados,
                'reprobados': total_respuestas - aprobados,
                'promedio_calificacion': round(promedio_calificacion, 2)
            },
            'preguntas': {
                'total_activas': total_preguntas_activas
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/respuestas/vaciar', methods=['DELETE'])
def vaciar_respuestas():
    """Elimina todas las respuestas del contenedor"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        
        # Obtener todas las respuestas (solo ID)
        consulta = "SELECT c.id FROM c"
        respuestas = servicio_cosmos.consultar_documentos(contenedor_respuestas, consulta)
        
        eliminados = 0
        errores = 0
        
        for respuesta in respuestas:
            # El partition key es el mismo id del documento
            resultado = servicio_cosmos.eliminar_documento(
                contenedor_respuestas, 
                respuesta['id'], 
                respuesta['id']  # partition_key = id
            )
            
            if resultado and resultado.get('success'):
                eliminados += 1
            else:
                errores += 1
        
        if errores > 0:
            return jsonify({
                'mensaje': f'{eliminados} respuestas eliminadas. {errores} errores encontrados.',
                'total_eliminados': eliminados,
                'errores': errores
            }), 206  # 206 = Partial Content
        else:
            return jsonify({
                'mensaje': f'{eliminados} respuestas eliminadas exitosamente',
                'total_eliminados': eliminados
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/respuestas/<respuesta_id>', methods=['DELETE'])
def eliminar_respuesta_individual(respuesta_id):
    """Elimina una respuesta específica por ID"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        
        # El contenedor está configurado con /id como partition key
        # Por lo tanto, el partition_key es el mismo respuesta_id
        resultado = servicio_cosmos.eliminar_documento(
            contenedor_respuestas, 
            respuesta_id, 
            respuesta_id  # partition_key = id
        )
        
        if resultado and resultado.get('success'):
            return jsonify({'mensaje': 'Respuesta eliminada exitosamente'}), 200
        else:
            error_msg = resultado.get('message', 'Error al eliminar la respuesta') if resultado else 'Error desconocido'
            return jsonify({'error': error_msg}), 500
            
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500