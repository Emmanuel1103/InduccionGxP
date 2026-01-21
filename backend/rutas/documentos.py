from flask import Blueprint, jsonify, request, current_app
from servicios.cosmos_db import servicio_cosmos
import uuid
from datetime import datetime, timezone

bp_documentos = Blueprint('documentos', __name__)

def obtener_fecha_utc():
    """Retorna la fecha y hora actual en UTC"""
    return datetime.now(timezone.utc).isoformat()

@bp_documentos.route('', methods=['GET'])
def listar_documentos():
    """Lista todos los documentos activos ordenados por orden"""
    try:
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        
        # Obtener solo documentos activos, ordenados
        consulta = "SELECT * FROM c WHERE c.activo = true ORDER BY c.orden ASC"
        documentos = servicio_cosmos.consultar_documentos(contenedor_documentos, consulta)
        
        return jsonify(documentos), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_documentos.route('/todos', methods=['GET'])
def listar_todos_documentos():
    """Lista todos los documentos (activos e inactivos) para administración"""
    try:
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        
        consulta = "SELECT * FROM c ORDER BY c.orden ASC"
        documentos = servicio_cosmos.consultar_documentos(contenedor_documentos, consulta)
        
        return jsonify(documentos), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_documentos.route('', methods=['POST'])
def crear_documento():
    """Crea un nuevo documento"""
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['nombre', 'link', 'tipo']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Validar tipo de archivo
        tipos_validos = ['pdf', 'docx', 'xlsx', 'pptx', 'link', 'otro']
        if datos['tipo'] not in tipos_validos:
            return jsonify({'error': f'Tipo de archivo inválido. Debe ser uno de: {", ".join(tipos_validos)}'}), 400
        
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        
        # Obtener el siguiente número de orden
        consulta = "SELECT VALUE MAX(c.orden) FROM c"
        resultado = servicio_cosmos.consultar_documentos(contenedor_documentos, consulta)
        max_orden = resultado[0] if resultado and resultado[0] is not None else 0
        
        # Crear documento
        doc_id = str(uuid.uuid4())
        documento = {
            'id': doc_id,
            'nombre': datos['nombre'],
            'link': datos['link'],
            'tipo': datos['tipo'],
            'descripcion': datos.get('descripcion', ''),
            'orden': datos.get('orden', max_orden + 1),
            'activo': datos.get('activo', True),
            'fecha_creacion': obtener_fecha_utc(),
            'fecha_modificacion': obtener_fecha_utc()
        }
        
        resultado = servicio_cosmos.crear_documento(contenedor_documentos, documento)
        
        if resultado:
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al crear documento'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_documentos.route('/<documento_id>', methods=['PUT'])
def actualizar_documento(documento_id):
    """Actualiza un documento existente"""
    try:
        datos = request.get_json()
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        
        # Obtener documento existente
        documento = servicio_cosmos.leer_documento(contenedor_documentos, documento_id, documento_id)
        
        if not documento:
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        # Validar tipo si se proporciona
        if 'tipo' in datos:
            tipos_validos = ['pdf', 'docx', 'xlsx', 'pptx', 'link', 'otro']
            if datos['tipo'] not in tipos_validos:
                return jsonify({'error': f'Tipo de archivo inválido. Debe ser uno de: {", ".join(tipos_validos)}'}), 400
        
        # Actualizar campos
        if 'nombre' in datos:
            documento['nombre'] = datos['nombre']
        if 'link' in datos:
            documento['link'] = datos['link']
        if 'tipo' in datos:
            documento['tipo'] = datos['tipo']
        if 'descripcion' in datos:
            documento['descripcion'] = datos['descripcion']
        if 'orden' in datos:
            documento['orden'] = datos['orden']
        if 'activo' in datos:
            documento['activo'] = datos['activo']
        
        documento['fecha_modificacion'] = obtener_fecha_utc()
        
        resultado = servicio_cosmos.actualizar_documento(contenedor_documentos, documento)
        
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify({'error': 'Error al actualizar documento'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_documentos.route('/<documento_id>', methods=['DELETE'])
def eliminar_documento(documento_id):
    """Elimina un documento"""
    try:
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        
        # El partition key es el mismo id
        resultado = servicio_cosmos.eliminar_documento(
            contenedor_documentos,
            documento_id,
            documento_id
        )
        
        if resultado and resultado.get('success'):
            return jsonify({'mensaje': 'Documento eliminado exitosamente'}), 200
        else:
            error_msg = resultado.get('message', 'Error al eliminar documento') if resultado else 'Error desconocido'
            return jsonify({'error': error_msg}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_documentos.route('/reordenar', methods=['PUT'])
def reordenar_documentos():
    """Reordena los documentos según un array de IDs"""
    try:
        datos = request.get_json()
        
        if 'orden' not in datos or not isinstance(datos['orden'], list):
            return jsonify({'error': 'Se requiere un array de IDs en el campo "orden"'}), 400
        
        contenedor_documentos = current_app.config['COSMOS_CONTAINER_DOCUMENTOS']
        actualizados = 0
        
        for idx, doc_id in enumerate(datos['orden']):
            documento = servicio_cosmos.leer_documento(contenedor_documentos, doc_id, doc_id)
            
            if documento:
                documento['orden'] = idx + 1
                documento['fecha_modificacion'] = obtener_fecha_utc()
                servicio_cosmos.actualizar_documento(contenedor_documentos, documento)
                actualizados += 1
        
        return jsonify({
            'mensaje': f'{actualizados} documentos reordenados exitosamente',
            'total': actualizados
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
