"""
Script para agregar documentos de ejemplo al contenedor
"""
from azure.cosmos import CosmosClient
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime

load_dotenv()

endpoint = os.getenv('COSMOS_ENDPOINT')
key = os.getenv('COSMOS_KEY')
database_name = os.getenv('COSMOS_DATABASE', 'induccion_gxp')
container_name = os.getenv('COSMOS_CONTAINER_DOCUMENTOS', 'documentos')

cliente = CosmosClient(endpoint, key)
database = cliente.get_database_client(database_name)
container = database.get_container_client(container_name)

documentos_ejemplo = [
    {
        'nombre': 'GP-PL-01-V4 Política Gestión por procesos',
        'link': '/archivos/GP-PL-01-V4 Política Gestión por procesos.pdf',
        'tipo': 'pdf'
    },
    {
        'nombre': 'GP-MA-01-V2 Manual de gestión por procesos',
        'link': '/archivos/GP-MA-01-V2 Manual de gestión por procesos.pdf',
        'tipo': 'pdf'
    }
]

print("Agregando documentos de ejemplo...")
for i, doc_data in enumerate(documentos_ejemplo):
    doc_id = str(uuid.uuid4())
    documento = {
        'id': doc_id,
        'nombre': doc_data['nombre'],
        'link': doc_data['link'],
        'tipo': doc_data['tipo'],
        'orden': i + 1,
        'activo': True,
        'fecha_creacion': datetime.utcnow().isoformat(),
        'fecha_modificacion': datetime.utcnow().isoformat()
    }
    
    container.create_item(body=documento)
    print(f"✅ Agregado: {doc_data['nombre']}")

print("\n✅ Documentos agregados exitosamente")
