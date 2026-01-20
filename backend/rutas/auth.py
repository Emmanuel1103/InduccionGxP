from flask import Blueprint, request, jsonify, redirect, session, current_app
from servicios.cosmos_db import servicio_cosmos
import msal
import requests

bp_auth = Blueprint('auth', __name__)

def _construir_msal_app(cache=None):
    """Construye la aplicación MSAL para autenticación"""
    return msal.ConfidentialClientApplication(
        current_app.config['AZURE_CLIENT_ID'],
        authority=f"https://login.microsoftonline.com/{current_app.config['AZURE_TENANT_ID']}",
        client_credential=current_app.config['AZURE_CLIENT_SECRET'],
        token_cache=cache
    )

@bp_auth.route('/login', methods=['GET'])
def login():
    """Inicia el flujo de autenticación con Microsoft"""
    msal_app = _construir_msal_app()
    auth_url = msal_app.get_authorization_request_url(
        scopes=['User.Read'],
        redirect_uri=current_app.config['AZURE_REDIRECT_URI']
    )
    return jsonify({'auth_url': auth_url}), 200

@bp_auth.route('/callback', methods=['GET'])
def callback():
    """Maneja el callback de Microsoft después de la autenticación"""
    try:
        code = request.args.get('code')
        if not code:
            return redirect('http://localhost:5173/induccion?error=no_code')
        
        msal_app = _construir_msal_app()
        result = msal_app.acquire_token_by_authorization_code(
            code,
            scopes=['User.Read'],
            redirect_uri=current_app.config['AZURE_REDIRECT_URI']
        )
        
        if 'error' in result:
            return redirect(f"http://localhost:5173/induccion?error={result['error']}")
        
        # Obtener información del usuario
        access_token = result['access_token']
        graph_response = requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers={'Authorization': f'Bearer {access_token}'}
        ).json()
        
        email = graph_response.get('mail') or graph_response.get('userPrincipalName')
        nombre = graph_response.get('displayName', '')
        
        # Verificar si es administrador ANTES de crear sesión
        es_admin = verificar_es_admin(email)
        
        if not es_admin:
            # No es administrador, redirigir a inducción sin crear sesión
            return redirect('http://localhost:5173/induccion?error=sin_permisos')
        
        # Es administrador, crear sesión
        session['user'] = {
            'email': email,
            'nombre': nombre,
            'access_token': access_token
        }
        session['es_administrador'] = True
        
        return redirect('http://localhost:5173/configuracion')
        
    except Exception as e:
        print(f"Error en callback: {str(e)}")
        return redirect(f"http://localhost:5173/induccion?error=callback_failed")

@bp_auth.route('/usuario-actual', methods=['GET'])
def usuario_actual():
    """Obtiene el usuario actualmente autenticado"""
    if 'user' not in session:
        return jsonify({'autenticado': False}), 401
    
    return jsonify({
        'autenticado': True,
        'email': session['user']['email'],
        'nombre': session['user']['nombre'],
        'es_administrador': session.get('es_administrador', False)
    }), 200

@bp_auth.route('/logout', methods=['POST'])
def logout():
    """Cierra la sesión del usuario"""
    session.clear()
    return jsonify({'mensaje': 'Sesión cerrada'}), 200

def verificar_es_admin(email):
    """Verifica si un email es administrador"""
    try:
        contenedor_administradores = current_app.config['COSMOS_CONTAINER_ADMINISTRADORES']
        admin = servicio_cosmos.leer_documento(contenedor_administradores, email.lower(), email.lower())
        return admin is not None
    except:
        return False


@bp_auth.route('/verificar-admin', methods=['POST'])
def verificar_admin():
    """Verifica si un email es administrador"""
    try:
        datos = request.get_json()
        email = datos.get('email')
        
        if not email:
            return jsonify({'error': 'Se requiere el campo email'}), 400
        
        # Normalizar email a minúsculas
        email = email.lower().strip()
        
        contenedor_administradores = current_app.config['COSMOS_CONTAINER_ADMINISTRADORES']
        
        # Buscar administrador por email (que es el id)
        try:
            admin = servicio_cosmos.leer_documento(contenedor_administradores, email, email)
            
            if admin:
                return jsonify({
                    'es_administrador': True,
                    'email': admin['email'],
                    'rol': admin['rol']
                }), 200
            else:
                return jsonify({'es_administrador': False}), 200
                
        except Exception:
            return jsonify({'es_administrador': False}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_auth.route('/administradores', methods=['GET'])
def listar_administradores():
    """Lista todos los administradores"""
    try:
        contenedor_administradores = current_app.config['COSMOS_CONTAINER_ADMINISTRADORES']
        consulta = "SELECT * FROM c ORDER BY c.email ASC"
        
        administradores = servicio_cosmos.consultar_documentos(contenedor_administradores, consulta)
        
        return jsonify({
            'total': len(administradores),
            'administradores': administradores
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_auth.route('/administradores', methods=['POST'])
def agregar_administrador():
    """Agrega un nuevo administrador"""
    try:
        datos = request.get_json()
        email = datos.get('email')
        
        if not email:
            return jsonify({'error': 'Se requiere el campo email'}), 400
        
        # Normalizar email a minúsculas
        email = email.lower().strip()
        
        # Validar que sea email de la fundación
        if not email.endswith('@fundacionsantodomingo.org'):
            return jsonify({'error': 'Solo se permiten correos @fundacionsantodomingo.org'}), 400
        
        contenedor_administradores = current_app.config['COSMOS_CONTAINER_ADMINISTRADORES']
        
        # Verificar si ya existe
        try:
            existe = servicio_cosmos.leer_documento(contenedor_administradores, email, email)
            if existe:
                return jsonify({'error': 'El administrador ya existe'}), 400
        except:
            pass  # No existe, podemos continuar
        
        # Crear administrador
        administrador = {
            'id': email,
            'email': email,
            'rol': 'administrador'
        }
        
        resultado = servicio_cosmos.crear_documento(contenedor_administradores, administrador)
        
        if resultado:
            return jsonify(resultado), 201
        else:
            return jsonify({'error': 'Error al crear administrador'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_auth.route('/administradores/<email>', methods=['DELETE'])
def eliminar_administrador(email):
    """Elimina un administrador"""
    try:
        email = email.lower().strip()
        contenedor_administradores = current_app.config['COSMOS_CONTAINER_ADMINISTRADORES']
        
        # Verificar que existe
        admin = servicio_cosmos.leer_documento(contenedor_administradores, email, email)
        
        if not admin:
            return jsonify({'error': 'Administrador no encontrado'}), 404
        
        # Eliminar
        resultado = servicio_cosmos.eliminar_documento(contenedor_administradores, email, email)
        
        if resultado:
            return jsonify({'mensaje': 'Administrador eliminado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar administrador'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
