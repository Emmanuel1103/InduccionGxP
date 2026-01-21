"""
Rutas para gestionar la configuración de la inducción
"""
from flask import Blueprint, jsonify, request, current_app
from datetime import datetime
from servicios.cosmos_db import servicio_cosmos

bp_configuracion = Blueprint('configuracion', __name__)

@bp_configuracion.route('/induccion', methods=['GET'])
def obtener_configuracion_induccion():
    """Obtiene la configuración actual de la inducción"""
    try:
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Buscar documento de configuración de inducción
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if items:
            return jsonify(items[0]), 200
        else:
            # Retornar configuración por defecto si no existe
            return jsonify({
                "id": "induccion_general",
                "tipo": "induccion",
                "titulo": "Inducción gestión por procesos",
                "video_url": "/videos/induccion.mp4",
                "descripcion": "En esta sesión cubriremos los pilares fundamentales de nuestra organización."
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion', methods=['PUT'])
def actualizar_configuracion_induccion():
    """Actualiza la configuración de la inducción"""
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        if not datos.get('titulo') or not datos.get('titulo').strip():
            return jsonify({"error": "El título es requerido"}), 400
        if not datos.get('descripcion') or not datos.get('descripcion').strip():
            return jsonify({"error": "La descripción es requerida"}), 400
        # video_url es opcional
        
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Preparar documento actualizado
        documento = {
            "id": "induccion_general",
            "tipo": "induccion",
            "titulo": datos['titulo'].strip(),
            "video_url": datos.get('video_url', '').strip(),  # Opcional
            "descripcion": datos['descripcion'].strip(),
            "fecha_modificacion": datetime.utcnow().isoformat()
        }
        
        # Actualizar documento (upsert)
        resultado = servicio_cosmos.actualizar_documento(contenedor_configuracion, documento)
        
        if resultado:
            return jsonify({
                "mensaje": "Configuración actualizada exitosamente",
                "configuracion": resultado
            }), 200
        else:
            return jsonify({"error": "Error al actualizar configuración"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
