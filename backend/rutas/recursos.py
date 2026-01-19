from flask import Blueprint, request, jsonify, current_app
from servicios.azure_storage import servicio_storage
from werkzeug.utils import secure_filename
import os

bp_recursos = Blueprint('recursos', __name__)

@bp_recursos.route('/videos', methods=['GET'])
def listar_videos():
    """Lista todos los videos disponibles"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        contenedor_videos = current_app.config['AZURE_STORAGE_CONTAINER_VIDEOS']
        videos = servicio_storage.listar_archivos(contenedor_videos)
        
        return jsonify(videos), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_recursos.route('/videos/<nombre_video>', methods=['GET'])
def obtener_video_url(nombre_video):
    """Obtiene la URL de un video con SAS token"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        contenedor_videos = current_app.config['AZURE_STORAGE_CONTAINER_VIDEOS']
        
        # Verificar si el video existe
        if not servicio_storage.existe_archivo(contenedor_videos, nombre_video):
            return jsonify({'error': 'Video no encontrado'}), 404
        
        # Generar URL con SAS (válida por 24 horas)
        url_sas = servicio_storage.generar_url_sas(contenedor_videos, nombre_video, duracion_horas=24)
        
        if url_sas:
            return jsonify({'url': url_sas}), 200
        else:
            return jsonify({'error': 'Error al generar URL'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_recursos.route('/videos', methods=['POST'])
def subir_video():
    """Sube un nuevo video al storage"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        # Verificar si hay archivo en la petición
        if 'archivo' not in request.files:
            return jsonify({'error': 'No se encontró archivo en la petición'}), 400
        
        archivo = request.files['archivo']
        
        if archivo.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Validar extensión del archivo
        extensiones_permitidas = {'.mp4', '.webm', '.ogg', '.mov'}
        extension = os.path.splitext(archivo.filename)[1].lower()
        
        if extension not in extensiones_permitidas:
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        # Generar nombre seguro para el archivo
        nombre_archivo = secure_filename(archivo.filename)
        
        # Subir archivo a Azure Storage
        contenedor_videos = current_app.config['AZURE_STORAGE_CONTAINER_VIDEOS']
        url = servicio_storage.subir_archivo(
            contenedor_videos, 
            nombre_archivo, 
            archivo.read(), 
            sobrescribir=False
        )
        
        if url:
            return jsonify({'mensaje': 'Video subido exitosamente', 'url': url}), 201
        else:
            return jsonify({'error': 'Error al subir video'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_recursos.route('/documentos', methods=['GET'])
def listar_documentos():
    """Lista todos los documentos/recursos disponibles"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        contenedor_recursos = current_app.config['AZURE_STORAGE_CONTAINER_RECURSOS']
        documentos = servicio_storage.listar_archivos(contenedor_recursos)
        
        return jsonify(documentos), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_recursos.route('/documentos/<nombre_documento>', methods=['GET'])
def obtener_documento_url(nombre_documento):
    """Obtiene la URL de un documento con SAS token"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        contenedor_recursos = current_app.config['AZURE_STORAGE_CONTAINER_RECURSOS']
        
        # Verificar si el documento existe
        if not servicio_storage.existe_archivo(contenedor_recursos, nombre_documento):
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        # Generar URL con SAS (válida por 24 horas)
        url_sas = servicio_storage.generar_url_sas(contenedor_recursos, nombre_documento, duracion_horas=24)
        
        if url_sas:
            return jsonify({'url': url_sas}), 200
        else:
            return jsonify({'error': 'Error al generar URL'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_recursos.route('/documentos', methods=['POST'])
def subir_documento():
    """Sube un nuevo documento al storage"""
    try:
        if not servicio_storage.cliente_blob:
            return jsonify({'error': 'Azure Storage no está configurado'}), 503
        
        if 'archivo' not in request.files:
            return jsonify({'error': 'No se encontró archivo en la petición'}), 400
        
        archivo = request.files['archivo']
        
        if archivo.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Validar extensión del archivo
        extensiones_permitidas = {'.pdf', '.docx', '.pptx', '.xlsx', '.txt'}
        extension = os.path.splitext(archivo.filename)[1].lower()
        
        if extension not in extensiones_permitidas:
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
        nombre_archivo = secure_filename(archivo.filename)
        
        # Subir archivo a Azure Storage
        contenedor_recursos = current_app.config['AZURE_STORAGE_CONTAINER_RECURSOS']
        url = servicio_storage.subir_archivo(
            contenedor_recursos, 
            nombre_archivo, 
            archivo.read(), 
            sobrescribir=False
        )
        
        if url:
            return jsonify({'mensaje': 'Documento subido exitosamente', 'url': url}), 201
        else:
            return jsonify({'error': 'Error al subir documento'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
