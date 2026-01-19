from flask import Blueprint, request, jsonify
from servicios.cosmos_db import servicio_cosmos
from flask import current_app
import uuid
from datetime import datetime

bp_usuarios = Blueprint('usuarios', __name__)

@bp_usuarios.route('/', methods=['POST'])
def crear_usuario():
    """Crea un nuevo usuario en la base de datos"""
    try:
        datos = request.get_json()
        
        # Validar datos requeridos
        campos_requeridos = ['nombre', 'email', 'rol']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Verificar si el usuario ya existe
        contenedor_usuarios = current_app.config['COSMOS_CONTAINER_USUARIOS']
        consulta = "SELECT * FROM c WHERE c.email = @email"
        parametros = [{"name": "@email", "value": datos['email']}]
        
        usuarios_existentes = servicio_cosmos.consultar_documentos(
            contenedor_usuarios, consulta, parametros
        )
        
        if usuarios_existentes:
            return jsonify({'error': 'El usuario ya existe'}), 409
        
        # Crear nuevo usuario
        usuario = {
            'id': str(uuid.uuid4()),
            'nombre': datos['nombre'],
            'email': datos['email'],
            'rol': datos['rol'],
            'fecha_registro': datetime.utcnow().isoformat(),
            'activo': True
        }
        
        resultado = servicio_cosmos.crear_documento(contenedor_usuarios, usuario)
        
        if resultado:
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al crear usuario'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_usuarios.route('/<usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtiene un usuario por su ID"""
    try:
        datos = request.args
        email = datos.get('email')
        
        if not email:
            return jsonify({'error': 'Se requiere el parámetro email'}), 400
        
        contenedor_usuarios = current_app.config['COSMOS_CONTAINER_USUARIOS']
        usuario = servicio_cosmos.leer_documento(contenedor_usuarios, usuario_id, email)
        
        if usuario:
            return jsonify(usuario), 200
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_usuarios.route('/email/<email>', methods=['GET'])
def obtener_usuario_por_email(email):
    """Obtiene un usuario por su email"""
    try:
        contenedor_usuarios = current_app.config['COSMOS_CONTAINER_USUARIOS']
        consulta = "SELECT * FROM c WHERE c.email = @email"
        parametros = [{"name": "@email", "value": email}]
        
        usuarios = servicio_cosmos.consultar_documentos(
            contenedor_usuarios, consulta, parametros
        )
        
        if usuarios:
            return jsonify(usuarios[0]), 200
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_usuarios.route('/<usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    """Actualiza la información de un usuario"""
    try:
        datos = request.get_json()
        email = datos.get('email')
        
        if not email:
            return jsonify({'error': 'Se requiere el campo email'}), 400
        
        contenedor_usuarios = current_app.config['COSMOS_CONTAINER_USUARIOS']
        usuario = servicio_cosmos.leer_documento(contenedor_usuarios, usuario_id, email)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Actualizar campos permitidos
        campos_actualizables = ['nombre', 'rol', 'activo']
        for campo in campos_actualizables:
            if campo in datos:
                usuario[campo] = datos[campo]
        
        resultado = servicio_cosmos.actualizar_documento(contenedor_usuarios, usuario)
        
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify({'error': 'Error al actualizar usuario'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_usuarios.route('/', methods=['GET'])
def listar_usuarios():
    """Lista todos los usuarios"""
    try:
        contenedor_usuarios = current_app.config['COSMOS_CONTAINER_USUARIOS']
        consulta = "SELECT * FROM c WHERE c.activo = true"
        
        usuarios = servicio_cosmos.consultar_documentos(contenedor_usuarios, consulta)
        
        return jsonify(usuarios), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
