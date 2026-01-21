from flask import Blueprint, request, jsonify, current_app
from servicios.azure_storage import servicio_storage
from servicios.cosmos_db import servicio_cosmos
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import os

bp_video = Blueprint('video', __name__)

ALLOWED_EXTENSIONS = {'mp4', 'webm', 'ogg', 'mov'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp_video.route('/upload', methods=['POST'])
def subir_video():
    """Sube un video a Azure Storage y actualiza la configuración"""
    try:
        # Verificar que se envió un archivo
        if 'video' not in request.files:
            return jsonify({"error": "No se envió ningún archivo"}), 400
        
        archivo = request.files['video']
        
        if archivo.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400
        
        # Validar extensión
        if not allowed_file(archivo.filename):
            return jsonify({
                "error": f"Formato no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Validar tamaño (opcional, ya que Flask tiene su propio límite)
        archivo.seek(0, os.SEEK_END)
        file_size = archivo.tell()
        archivo.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                "error": f"El archivo es demasiado grande. Máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
            }), 400
        
        # Usar el nombre original del archivo (sanitizado)
        import re
        original_filename = archivo.filename
        # Sanitizar el nombre del archivo (remover caracteres especiales)
        video_filename = re.sub(r'[^\w\-_\. ]', '_', original_filename)
        container_name = current_app.config['AZURE_STORAGE_CONTAINER_VIDEOS']
        
        # Verificar que Azure Storage esté configurado
        if not servicio_storage.cliente_blob:
            return jsonify({
                "error": "Azure Storage no está configurado"
            }), 500
        
        # Subir archivo a Azure Storage
        contenedor = servicio_storage.contenedores.get(container_name)
        if not contenedor:
            return jsonify({
                "error": f"Contenedor '{container_name}' no encontrado"
            }), 500
        
        blob_client = contenedor.get_blob_client(video_filename)
        
        # Subir archivo (sobrescribir si existe)
        blob_client.upload_blob(archivo, overwrite=True)
        
        # Generar SAS URL
        connection_string = current_app.config['AZURE_STORAGE_CONNECTION_STRING']
        connection_parts = dict(item.split('=', 1) for item in connection_string.split(';') if '=' in item)
        
        account_name = connection_parts.get('AccountName')
        account_key = connection_parts.get('AccountKey')
        
        if not account_name or not account_key:
            return jsonify({"error": "Error al generar URL"}), 500
        
        # Generar SAS token válido por 30 días
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=video_filename,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(days=30)  # 30 días
        )
        
        video_url = f"{blob_client.url}?{sas_token}"
        
        # Actualizar configuración automáticamente
        contenedor_config = current_app.config['COSMOS_CONTAINER_CONFIGURACION']
        query = "SELECT * FROM c WHERE c.tipo = 'induccion' AND c.id = 'induccion_general'"
        items = servicio_cosmos.consultar_documentos(contenedor_config, query)
        
        if items:
            config = items[0]
            config['video_url'] = video_url
            config['fecha_modificacion'] = datetime.utcnow().isoformat()
            
            resultado = servicio_cosmos.actualizar_documento(contenedor_config, config)
            
            if resultado:
                return jsonify({
                    "mensaje": "Video subido y configuración actualizada exitosamente",
                    "video_url": video_url
                }), 200
            else:
                return jsonify({
                    "error": "Video subido pero no se pudo actualizar la configuración"
                }), 500
        else:
            return jsonify({
                "error": "Configuración de inducción no encontrada"
            }), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
