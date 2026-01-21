import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-desarrollo-no-usar-en-produccion')
    
    # Azure AD / Microsoft Login
    AZURE_CLIENT_ID = os.getenv('AZURE_CLIENT_ID')
    AZURE_CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')
    AZURE_TENANT_ID = os.getenv('AZURE_TENANT_ID')
    AZURE_REDIRECT_URI = os.getenv('AZURE_REDIRECT_URI', 'http://localhost:5000/api/auth/callback')
    
    # Azure CosmosDB
    COSMOS_ENDPOINT = os.getenv('COSMOS_ENDPOINT')
    COSMOS_KEY = os.getenv('COSMOS_KEY')
    COSMOS_DATABASE = os.getenv('COSMOS_DATABASE', 'induccion_gxp')
    COSMOS_CONTAINER_RESPUESTAS = os.getenv('COSMOS_CONTAINER_RESPUESTAS', 'respuestas')
    COSMOS_CONTAINER_PREGUNTAS = os.getenv('COSMOS_CONTAINER_PREGUNTAS', 'preguntas')
    COSMOS_CONTAINER_ADMINISTRADORES = os.getenv('COSMOS_CONTAINER_ADMINISTRADORES', 'administradores')
    # COSMOS_CONTAINER_DOCUMENTOS = os.getenv('COSMOS_CONTAINER_DOCUMENTOS', 'documentos')  # DEPRECATED: Moved to configuracion
    COSMOS_CONTAINER_CONFIGURACION = os.getenv('COSMOS_CONTAINER_CONFIGURACION', 'configuracion')
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    AZURE_STORAGE_CONTAINER_VIDEOS = os.getenv('AZURE_STORAGE_CONTAINER_VIDEOS', 'videoinduccion')
    AZURE_STORAGE_CONTAINER_RECURSOS = os.getenv('AZURE_STORAGE_CONTAINER_RECURSOS', 'recursos')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')

class ConfigDesarrollo(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    FLASK_ENV = 'development'

class ConfigProduccion(Config):
    """Configuración para producción"""
    DEBUG = False
    FLASK_ENV = 'production'

# Diccionario de configuraciones
configuraciones = {
    'desarrollo': ConfigDesarrollo,
    'produccion': ConfigProduccion,
    'default': ConfigDesarrollo
}
