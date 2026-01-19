from flask import Blueprint, request, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app
import uuid
from datetime import datetime

bp_progreso = Blueprint('progreso', __name__)

@bp_progreso.route('/<usuario_id>', methods=['GET'])
def obtener_progreso(usuario_id):
    """Obtiene el progreso de un usuario"""
    try:
        contenedor_progreso = current_app.config['COSMOS_CONTAINER_PROGRESO']
        consulta = "SELECT * FROM c WHERE c.usuario_id = @usuario_id"
        parametros = [{"name": "@usuario_id", "value": usuario_id}]
        
        progreso = servicio_cosmos.consultar_documentos(
            contenedor_progreso, consulta, parametros
        )
        
        if progreso:
            return jsonify(progreso[0]), 200
        else:
            # Si no existe progreso, crear uno nuevo
            nuevo_progreso = {
                'id': str(uuid.uuid4()),
                'usuario_id': usuario_id,
                'modulos_completados': [],
                'videos_vistos': [],
                'cuestionarios_completados': [],
                'porcentaje_completado': 0,
                'fecha_inicio': datetime.utcnow().isoformat(),
                'ultima_actividad': datetime.utcnow().isoformat()
            }
            
            resultado = servicio_cosmos.crear_documento(contenedor_progreso, nuevo_progreso)
            return jsonify(resultado), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_progreso.route('/<usuario_id>/video', methods=['POST'])
def marcar_video_visto(usuario_id):
    """Marca un video como visto"""
    try:
        datos = request.get_json()
        video_id = datos.get('video_id')
        
        if not video_id:
            return jsonify({'error': 'Se requiere el campo video_id'}), 400
        
        contenedor_progreso = current_app.config['COSMOS_CONTAINER_PROGRESO']
        consulta = "SELECT * FROM c WHERE c.usuario_id = @usuario_id"
        parametros = [{"name": "@usuario_id", "value": usuario_id}]
        
        progreso = servicio_cosmos.consultar_documentos(
            contenedor_progreso, consulta, parametros
        )
        
        if not progreso:
            return jsonify({'error': 'Progreso no encontrado'}), 404
        
        progreso = progreso[0]
        
        # Agregar video si no está en la lista
        if video_id not in progreso['videos_vistos']:
            progreso['videos_vistos'].append(video_id)
            progreso['ultima_actividad'] = datetime.utcnow().isoformat()
            
            # Calcular porcentaje (esto es un ejemplo, ajustar según lógica de negocio)
            total_items = 10  # Ajustar según la cantidad total de contenido
            items_completados = len(progreso['videos_vistos']) + len(progreso['cuestionarios_completados'])
            progreso['porcentaje_completado'] = min(100, (items_completados / total_items) * 100)
            
            resultado = servicio_cosmos.actualizar_documento(contenedor_progreso, progreso)
            return jsonify(resultado), 200
        else:
            return jsonify({'mensaje': 'Video ya marcado como visto'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_progreso.route('/<usuario_id>/modulo', methods=['POST'])
def completar_modulo(usuario_id):
    """Marca un módulo como completado"""
    try:
        datos = request.get_json()
        modulo_id = datos.get('modulo_id')
        
        if not modulo_id:
            return jsonify({'error': 'Se requiere el campo modulo_id'}), 400
        
        contenedor_progreso = current_app.config['COSMOS_CONTAINER_PROGRESO']
        consulta = "SELECT * FROM c WHERE c.usuario_id = @usuario_id"
        parametros = [{"name": "@usuario_id", "value": usuario_id}]
        
        progreso = servicio_cosmos.consultar_documentos(
            contenedor_progreso, consulta, parametros
        )
        
        if not progreso:
            return jsonify({'error': 'Progreso no encontrado'}), 404
        
        progreso = progreso[0]
        
        # Agregar módulo si no está en la lista
        if modulo_id not in progreso['modulos_completados']:
            progreso['modulos_completados'].append(modulo_id)
            progreso['ultima_actividad'] = datetime.utcnow().isoformat()
            
            resultado = servicio_cosmos.actualizar_documento(contenedor_progreso, progreso)
            return jsonify(resultado), 200
        else:
            return jsonify({'mensaje': 'Módulo ya completado'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_progreso.route('/<usuario_id>', methods=['PUT'])
def actualizar_progreso(usuario_id):
    """Actualiza el progreso general del usuario"""
    try:
        datos = request.get_json()
        
        contenedor_progreso = current_app.config['COSMOS_CONTAINER_PROGRESO']
        consulta = "SELECT * FROM c WHERE c.usuario_id = @usuario_id"
        parametros = [{"name": "@usuario_id", "value": usuario_id}]
        
        progreso = servicio_cosmos.consultar_documentos(
            contenedor_progreso, consulta, parametros
        )
        
        if not progreso:
            return jsonify({'error': 'Progreso no encontrado'}), 404
        
        progreso = progreso[0]
        
        # Actualizar campos permitidos
        campos_actualizables = ['modulos_completados', 'videos_vistos', 'cuestionarios_completados', 'porcentaje_completado']
        for campo in campos_actualizables:
            if campo in datos:
                progreso[campo] = datos[campo]
        
        progreso['ultima_actividad'] = datetime.utcnow().isoformat()
        
        resultado = servicio_cosmos.actualizar_documento(contenedor_progreso, progreso)
        
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify({'error': 'Error al actualizar progreso'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
