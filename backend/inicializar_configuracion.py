"""
Script para inicializar datos de configuración en Cosmos DB
"""
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, PartitionKey

# Cargar variables de entorno
load_dotenv()

# Configuración de Cosmos DB
COSMOS_ENDPOINT = os.getenv('COSMOS_ENDPOINT')
COSMOS_KEY = os.getenv('COSMOS_KEY')
COSMOS_DATABASE = os.getenv('COSMOS_DATABASE', 'induccion_gxp')
COSMOS_CONTAINER = os.getenv('COSMOS_CONTAINER_CONFIGURACION', 'configuracion')

def inicializar_configuracion():
    """Inicializa los documentos de configuración en Cosmos DB"""
    try:
        # Conectar a Cosmos DB
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(COSMOS_DATABASE)
        container = database.get_container_client(COSMOS_CONTAINER)
        
        print(f"Conectado a contenedor: {COSMOS_CONTAINER}")
        
        # Documento de configuración de inducción
        config_induccion = {
            "id": "induccion_general",
            "tipo": "induccion",
            "titulo": "Inducción gestión por procesos",
            "video_url": "/videos/induccion.mp4",
            "descripcion": "En esta sesión cubriremos los pilares fundamentales de nuestra organización. Comenzaremos con la bienvenida institucional y exploraremos cómo trabajamos bajo un modelo de gestión por procesos.",
            "fecha_modificacion": datetime.utcnow().isoformat()
        }
        
        # Documento de administradores (vacío inicialmente)
        config_administradores = {
            "id": "administradores",
            "tipo": "administradores",
            "correos": "",  # Se llenará con la migración
            "fecha_modificacion": datetime.utcnow().isoformat()
        }
        
        # Insertar o actualizar documentos
        try:
            container.upsert_item(config_induccion)
            print("✓ Configuración de inducción creada/actualizada")
        except Exception as e:
            print(f"✗ Error al crear configuración de inducción: {e}")
        
        try:
            container.upsert_item(config_administradores)
            print("✓ Configuración de administradores creada/actualizada")
        except Exception as e:
            print(f"✗ Error al crear configuración de administradores: {e}")
        
        print("\n✅ Inicialización completada exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error al inicializar configuración: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("=== Inicialización de Configuración ===\n")
    inicializar_configuracion()
