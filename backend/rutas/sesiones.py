from flask import Blueprint, request, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app
import uuid
from datetime import datetime

bp_sesiones = Blueprint('sesiones', __name__)

@bp_sesiones.route('/', methods=['POST'])
def crear_sesion():
    """Crea una nueva sesión de inducción anónima"""
    try:
        datos = request.get_json() or {}
        
        # Crear sesión con ID único
        sesion = {
            'id': str(uuid.uuid4()),
            'sesion_id': str(uuid.uuid4()),
            'fecha_inicio': datetime.utcnow().isoformat(),
            'ultima_actividad': datetime.utcnow().isoformat(),
            'modulos_completados': [],
            'videos_vistos': [],
            'cuestionarios_completados': [],
            'porcentaje_completado': 0,
            'intentos': 1,
            'metadata': datos.get('metadata', {})  # Datos opcionales como navegador, etc.
        }
        
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        resultado = servicio_cosmos.crear_documento(contenedor_sesiones, sesion)
        
        if resultado:
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al crear sesión'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/<sesion_id>', methods=['GET'])
def obtener_sesion(sesion_id):
    """Obtiene los datos de una sesión específica"""
    try:
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        sesion = servicio_cosmos.leer_documento(contenedor_sesiones, sesion_id, sesion_id)
        
        if sesion:
            return jsonify(sesion), 200
        else:
            return jsonify({'error': 'Sesión no encontrada'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/<sesion_id>/video', methods=['POST'])
def marcar_video_visto(sesion_id):
    """Marca un video como visto en la sesión"""
    try:
        datos = request.get_json()
        video_id = datos.get('video_id')
        
        if not video_id:
            return jsonify({'error': 'Se requiere el campo video_id'}), 400
        
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        sesion = servicio_cosmos.leer_documento(contenedor_sesiones, sesion_id, sesion_id)
        
        if not sesion:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        # Agregar video si no está en la lista
        if video_id not in sesion['videos_vistos']:
            sesion['videos_vistos'].append(video_id)
            sesion['ultima_actividad'] = datetime.utcnow().isoformat()
            
            # Calcular porcentaje (ajustar según contenido total)
            total_items = 10
            items_completados = len(sesion['videos_vistos']) + len(sesion['cuestionarios_completados'])
            sesion['porcentaje_completado'] = min(100, int((items_completados / total_items) * 100))
            
            resultado = servicio_cosmos.actualizar_documento(contenedor_sesiones, sesion)
            return jsonify(resultado), 200
        else:
            return jsonify({'mensaje': 'Video ya marcado como visto'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/<sesion_id>/modulo', methods=['POST'])
def completar_modulo(sesion_id):
    """Marca un módulo como completado"""
    try:
        datos = request.get_json()
        modulo_id = datos.get('modulo_id')
        
        if not modulo_id:
            return jsonify({'error': 'Se requiere el campo modulo_id'}), 400
        
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        sesion = servicio_cosmos.leer_documento(contenedor_sesiones, sesion_id, sesion_id)
        
        if not sesion:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        # Agregar módulo si no está en la lista
        if modulo_id not in sesion['modulos_completados']:
            sesion['modulos_completados'].append(modulo_id)
            sesion['ultima_actividad'] = datetime.utcnow().isoformat()
            
            resultado = servicio_cosmos.actualizar_documento(contenedor_sesiones, sesion)
            return jsonify(resultado), 200
        else:
            return jsonify({'mensaje': 'Módulo ya completado'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/<sesion_id>', methods=['PUT'])
def actualizar_sesion(sesion_id):
    """Actualiza datos de la sesión"""
    try:
        datos = request.get_json()
        
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        sesion = servicio_cosmos.leer_documento(contenedor_sesiones, sesion_id, sesion_id)
        
        if not sesion:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        # Actualizar campos permitidos
        campos_actualizables = ['modulos_completados', 'videos_vistos', 'cuestionarios_completados', 
                               'porcentaje_completado', 'intentos', 'metadata']
        for campo in campos_actualizables:
            if campo in datos:
                sesion[campo] = datos[campo]
        
        sesion['ultima_actividad'] = datetime.utcnow().isoformat()
        
        resultado = servicio_cosmos.actualizar_documento(contenedor_sesiones, sesion)
        
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify({'error': 'Error al actualizar sesión'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/', methods=['GET'])
def listar_sesiones():
    """Lista todas las sesiones (útil para reportes y estadísticas)"""
    try:
        # Parámetros opcionales de filtrado
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        limite = int(request.args.get('limite', 100))
        
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        
        if fecha_desde or fecha_hasta:
            # Consulta con filtros de fecha
            condiciones = []
            parametros = []
            
            if fecha_desde:
                condiciones.append("c.fecha_inicio >= @fecha_desde")
                parametros.append({"name": "@fecha_desde", "value": fecha_desde})
            
            if fecha_hasta:
                condiciones.append("c.fecha_inicio <= @fecha_hasta")
                parametros.append({"name": "@fecha_hasta", "value": fecha_hasta})
            
            where_clause = " AND ".join(condiciones)
            consulta = f"SELECT TOP {limite} * FROM c WHERE {where_clause} ORDER BY c.fecha_inicio DESC"
            
            sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, consulta, parametros)
        else:
            # Sin filtros
            consulta = f"SELECT TOP {limite} * FROM c ORDER BY c.fecha_inicio DESC"
            sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, consulta)
        
        return jsonify(sesiones), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_sesiones.route('/estadisticas', methods=['GET'])
def obtener_estadisticas_generales():
    """Obtiene estadísticas generales de todas las sesiones"""
    try:
        contenedor_sesiones = current_app.config['COSMOS_CONTAINER_SESIONES']
        consulta = "SELECT * FROM c"
        
        sesiones = servicio_cosmos.consultar_documentos(contenedor_sesiones, consulta)
        
        if not sesiones:
            return jsonify({
                'total_sesiones': 0,
                'sesiones_completadas': 0,
                'porcentaje_completado_promedio': 0,
                'total_intentos': 0
            }), 200
        
        total_sesiones = len(sesiones)
        sesiones_completadas = sum(1 for s in sesiones if s.get('porcentaje_completado', 0) == 100)
        porcentajes = [s.get('porcentaje_completado', 0) for s in sesiones]
        promedio_completado = sum(porcentajes) / len(porcentajes) if porcentajes else 0
        total_intentos = sum(s.get('intentos', 1) for s in sesiones)
        
        estadisticas = {
            'total_sesiones': total_sesiones,
            'sesiones_completadas': sesiones_completadas,
            'sesiones_incompletas': total_sesiones - sesiones_completadas,
            'porcentaje_completado_promedio': round(promedio_completado, 2),
            'total_intentos': total_intentos,
            'promedio_intentos_por_sesion': round(total_intentos / total_sesiones, 2) if total_sesiones > 0 else 0
        }
        
        return jsonify(estadisticas), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
