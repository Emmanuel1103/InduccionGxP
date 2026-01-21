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
        
        # Obtener configuración actual para preservar documentos
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        documentos_existentes = items[0].get('documentos', []) if items else []
        
        # Preparar documento actualizado
        documento = {
            "id": "induccion_general",
            "tipo": "induccion",
            "titulo": datos['titulo'].strip(),
            "video_url": datos.get('video_url', '').strip(),  # Opcional
            "descripcion": datos['descripcion'].strip(),
            "documentos": documentos_existentes,  # Preservar documentos
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

@bp_configuracion.route('/induccion/documentos', methods=['GET'])
def obtener_documentos():
    """Obtiene los documentos ACTIVOS de la inducción (para usuarios)"""
    try:
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Buscar documento de configuración
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if items and 'documentos' in items[0]:
            # Filtrar solo documentos activos y ordenar por campo 'orden'
            documentos = [doc for doc in items[0]['documentos'] if doc.get('activo', True)]
            documentos_ordenados = sorted(documentos, key=lambda x: x.get('orden', 999))
            return jsonify(documentos_ordenados), 200
        else:
            return jsonify([]), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion/documentos/todos', methods=['GET'])
def obtener_todos_documentos():
    """Obtiene TODOS los documentos de la inducción (activos e inactivos, para admin)"""
    try:
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Buscar documento de configuración
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if items and 'documentos' in items[0]:
            # Retornar TODOS los documentos (activos e inactivos) ordenados
            documentos_ordenados = sorted(items[0]['documentos'], key=lambda x: x.get('orden', 999))
            return jsonify(documentos_ordenados), 200
        else:
            return jsonify([]), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion/documentos', methods=['POST'])
def agregar_documento():
    """Agrega un nuevo documento al array"""
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        if not datos.get('nombre') or not datos.get('nombre').strip():
            return jsonify({"error": "El nombre es requerido"}), 400
        if not datos.get('tipo') or not datos.get('tipo').strip():
            return jsonify({"error": "El tipo es requerido"}), 400
        if not datos.get('url') or not datos.get('url').strip():
            return jsonify({"error": "La URL es requerida"}), 400
        
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Obtener configuración actual
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if not items:
            return jsonify({"error": "Configuración no encontrada"}), 404
        
        config = items[0]
        documentos = config.get('documentos', [])
        
        # Generar ID único para el documento
        import uuid
        nuevo_doc = {
            "id": f"doc_{uuid.uuid4().hex[:8]}",
            "tipo": datos['tipo'].strip(),
            "nombre": datos['nombre'].strip(),
            "url": datos['url'].strip(),
            "descripcion": datos.get('descripcion', '').strip(),
            "orden": datos.get('orden', len(documentos) + 1),
            "activo": datos.get('activo', True)  # IMPORTANTE: guardar el campo activo
        }
        
        documentos.append(nuevo_doc)
        config['documentos'] = documentos
        config['fecha_modificacion'] = datetime.utcnow().isoformat()
        
        # Actualizar documento
        resultado = servicio_cosmos.actualizar_documento(contenedor_configuracion, config)
        
        if resultado:
            return jsonify({
                "mensaje": "Documento agregado exitosamente",
                "documento": nuevo_doc
            }), 201
        else:
            return jsonify({"error": "Error al agregar documento"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion/documentos/<doc_id>', methods=['PUT'])
def actualizar_documento(doc_id):
    """Actualiza un documento específico"""
    try:
        datos = request.get_json()
        
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Obtener configuración actual
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if not items:
            return jsonify({"error": "Configuración no encontrada"}), 404
        
        config = items[0]
        documentos = config.get('documentos', [])
        
        # Buscar y actualizar documento
        doc_encontrado = False
        for doc in documentos:
            if doc['id'] == doc_id:
                doc['nombre'] = datos.get('nombre', doc['nombre']).strip()
                doc['tipo'] = datos.get('tipo', doc['tipo']).strip()
                doc['url'] = datos.get('url', doc['url']).strip()
                doc['descripcion'] = datos.get('descripcion', doc.get('descripcion', '')).strip()
                doc['orden'] = datos.get('orden', doc.get('orden', 1))
                doc['activo'] = datos.get('activo', doc.get('activo', True))  # IMPORTANTE: actualizar activo
                doc_encontrado = True
                break
        
        if not doc_encontrado:
            return jsonify({"error": "Documento no encontrado"}), 404
        
        config['documentos'] = documentos
        config['fecha_modificacion'] = datetime.utcnow().isoformat()
        
        # Actualizar documento
        resultado = servicio_cosmos.actualizar_documento(contenedor_configuracion, config)
        
        if resultado:
            return jsonify({
                "mensaje": "Documento actualizado exitosamente"
            }), 200
        else:
            return jsonify({"error": "Error al actualizar documento"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion/documentos/<doc_id>', methods=['DELETE'])
def eliminar_documento(doc_id):
    """Elimina un documento del array"""
    try:
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Obtener configuración actual
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if not items:
            return jsonify({"error": "Configuración no encontrada"}), 404
        
        config = items[0]
        documentos = config.get('documentos', [])
        
        # Filtrar documento a eliminar
        documentos_filtrados = [doc for doc in documentos if doc['id'] != doc_id]
        
        if len(documentos_filtrados) == len(documentos):
            return jsonify({"error": "Documento no encontrado"}), 404
        
        config['documentos'] = documentos_filtrados
        config['fecha_modificacion'] = datetime.utcnow().isoformat()
        
        # Actualizar documento
        resultado = servicio_cosmos.actualizar_documento(contenedor_configuracion, config)
        
        if resultado:
            return jsonify({
                "mensaje": "Documento eliminado exitosamente"
            }), 200
        else:
            return jsonify({"error": "Error al eliminar documento"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_configuracion.route('/induccion/documentos/reordenar', methods=['PUT'])
def reordenar_documentos():
    """Reordena los documentos"""
    try:
        datos = request.get_json()
        nuevo_orden = datos.get('documentos', [])
        
        if not nuevo_orden:
            return jsonify({"error": "Se requiere el array de documentos"}), 400
        
        contenedor_configuracion = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        
        # Obtener configuración actual
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_configuracion, query)
        
        if not items:
            return jsonify({"error": "Configuración no encontrada"}), 404
        
        config = items[0]
        
        # Actualizar orden
        for idx, doc_id in enumerate(nuevo_orden):
            for doc in config.get('documentos', []):
                if doc['id'] == doc_id:
                    doc['orden'] = idx + 1
                    break
        
        config['fecha_modificacion'] = datetime.utcnow().isoformat()
        
        # Actualizar documento
        resultado = servicio_cosmos.actualizar_documento(contenedor_configuracion, config)
        
        if resultado:
            return jsonify({
                "mensaje": "Documentos reordenados exitosamente"
            }), 200
        else:
            return jsonify({"error": "Error al reordenar documentos"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

