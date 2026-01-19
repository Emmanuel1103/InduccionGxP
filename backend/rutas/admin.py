from flask import Blueprint, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app

bp_admin = Blueprint('admin', __name__)

@bp_admin.route('/sesiones/todas', methods=['GET'])
def listar_todas_sesiones():
    """Lista todas las sesiones creadas"""
    try:
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        consulta = "SELECT * FROM c ORDER BY c.fecha_inicio DESC"
        
        sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, consulta)
        
        return jsonify({
            'total': len(sesiones),
            'sesiones': sesiones
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/respuestas/todas', methods=['GET'])
def listar_todas_respuestas():
    """Lista todas las respuestas guardadas"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = "SELECT * FROM c ORDER BY c.fecha_respuesta DESC"
        
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
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        contenedor_preguntas = current_app.config['COSMOS_CONTAINER_PREGUNTAS']
        
        # Contar sesiones
        sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, "SELECT * FROM c")
        total_sesiones = len(sesiones)
        
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
            'sesiones': {
                'total': total_sesiones,
                'sesiones_con_respuestas': total_respuestas
            },
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

@bp_admin.route('/sesiones/vaciar', methods=['DELETE'])
def vaciar_sesiones():
    """Elimina todas las sesiones del contenedor"""
    try:
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        consulta = "SELECT * FROM c"
        
        sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, consulta)
        eliminados = 0
        
        for sesion in sesiones:
            try:
                servicio_cosmos.eliminar_documento(
                    contenedor_sesiones, 
                    sesion['id'], 
                    sesion['sesion_id']
                )
                eliminados += 1
            except Exception as e:
                print(f"Error eliminando sesión {sesion['id']}: {str(e)}")
        
        return jsonify({
            'mensaje': f'{eliminados} sesiones eliminadas exitosamente',
            'total_eliminados': eliminados
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_admin.route('/respuestas/vaciar', methods=['DELETE'])
def vaciar_respuestas():
    """Elimina todas las respuestas del contenedor"""
    try:
        contenedor_respuestas = current_app.config['COSMOS_CONTAINER_RESPUESTAS']
        consulta = "SELECT * FROM c"
        
        respuestas = servicio_cosmos.consultar_documentos(contenedor_respuestas, consulta)
        eliminados = 0
        
        for respuesta in respuestas:
            try:
                servicio_cosmos.eliminar_documento(
                    contenedor_respuestas, 
                    respuesta['id'], 
                    respuesta['sesion_id']
                )
                eliminados += 1
            except Exception as e:
                print(f"Error eliminando respuesta {respuesta['id']}: {str(e)}")
        
        return jsonify({
            'mensaje': f'{eliminados} respuestas eliminadas exitosamente',
            'total_eliminados': eliminados
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
