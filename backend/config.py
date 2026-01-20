import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-desarrollo-no-usar-en-produccion')
    
    # Azure CosmosDB
    COSMOS_ENDPOINT = os.getenv('COSMOS_ENDPOINT')
    COSMOS_KEY = os.getenv('COSMOS_KEY')
    COSMOS_DATABASE = os.getenv('COSMOS_DATABASE', 'induccion_gxp')
    COSMOS_CONTAINER_RESPUESTAS = os.getenv('COSMOS_CONTAINER_RESPUESTAS', 'respuestas')
    COSMOS_CONTAINER_PREGUNTAS = os.getenv('COSMOS_CONTAINER_PREGUNTAS', 'preguntas')
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    AZURE_STORAGE_CONTAINER_VIDEOS = os.getenv('AZURE_STORAGE_CONTAINER_VIDEOS', 'videos')
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
