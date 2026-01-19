from flask import Flask
from flask_cors import CORS
from config import configuraciones
import os

def crear_app(nombre_config='default'):
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    config_obj = configuraciones.get(nombre_config, configuraciones['default'])
    app.config.from_object(config_obj)
    
    # Configurar CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Inicializar servicios de Azure con contexto de aplicación
    with app.app_context():
        from servicios.cosmos_db import servicio_cosmos
        from servicios.azure_storage import servicio_storage
        
        # Inicializar CosmosDB
        if app.config.get('COSMOS_ENDPOINT') and app.config.get('COSMOS_KEY'):
            cosmos_inicializado = servicio_cosmos.inicializar()
            if cosmos_inicializado:
                print('✓ CosmosDB inicializado correctamente')
            else:
                print('✗ Error: No se pudo inicializar CosmosDB')
        else:
            print('✗ Error: CosmosDB no configurado')
        
        # Inicializar Azure Storage (opcional)
        if app.config.get('AZURE_STORAGE_CONNECTION_STRING'):
            storage_inicializado = servicio_storage.inicializar()
            if storage_inicializado:
                print('✓ Azure Storage inicializado correctamente')
            else:
                print('⚠ Azure Storage no disponible - Endpoints de recursos deshabilitados')
        else:
            print('⚠ Azure Storage no configurado - Endpoints de recursos deshabilitados')
    
    # Registrar blueprints
    from rutas.sesiones import bp_sesiones
    from rutas.recursos import bp_recursos
    from rutas.cuestionarios import bp_cuestionarios
    from rutas.preguntas import bp_preguntas
    from rutas.admin import bp_admin
    
    app.register_blueprint(bp_sesiones, url_prefix='/api/sesiones')
    app.register_blueprint(bp_recursos, url_prefix='/api/recursos')
    app.register_blueprint(bp_cuestionarios, url_prefix='/api/cuestionarios')
    app.register_blueprint(bp_preguntas, url_prefix='/api/preguntas')
    app.register_blueprint(bp_admin, url_prefix='/api/admin')
    
    # Ruta de prueba
    @app.route('/api/salud', methods=['GET'])
    def verificar_salud():
        from servicios.cosmos_db import servicio_cosmos
        from servicios.azure_storage import servicio_storage
        
        estado_cosmos = servicio_cosmos.cliente is not None
        estado_storage = servicio_storage.cliente_blob is not None
        
        return {
            'estado': 'activo', 
            'mensaje': 'API de Inducción GxP funcionando',
            'servicios': {
                'cosmos_db': 'conectado' if estado_cosmos else 'no configurado',
                'azure_storage': 'conectado' if estado_storage else 'no configurado'
            }
        }, 200
    
    return app

if __name__ == '__main__':
    entorno = os.getenv('FLASK_ENV', 'desarrollo')
    app = crear_app(entorno)
    app.run(host='0.0.0.0', port=5000, debug=True)
