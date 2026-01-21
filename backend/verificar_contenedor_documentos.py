"""
Script para verificar y crear el contenedor de documentos en Cosmos DB
También agrega documentos de ejemplo
"""
from azure.cosmos import CosmosClient, exceptions
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime

load_dotenv()

def verificar_contenedor_documentos():
    """Verifica que el contenedor de documentos existe y está configurado correctamente"""
    
    endpoint = os.getenv('COSMOS_ENDPOINT')
    key = os.getenv('COSMOS_KEY')
    database_name = os.getenv('COSMOS_DATABASE', 'induccion_gxp')
    container_name = os.getenv('COSMOS_CONTAINER_DOCUMENTOS', 'documentos')
    
    print("="*70)
    print("VERIFICACIÓN DEL CONTENEDOR DE DOCUMENTOS")
    print("="*70)
    print()
    
    try:
        cliente = CosmosClient(endpoint, key)
        database = cliente.get_database_client(database_name)
        
        # Verificar si el contenedor existe
        try:
            container = database.get_container_client(container_name)
            propiedades = container.read()
            
            print(f"✅ Contenedor '{container_name}' encontrado")
            print(f"   Partition Key: {propiedades['partitionKey']['paths']}")
            
            # Contar documentos
            query = "SELECT VALUE COUNT(1) FROM c"
            items = list(container.query_items(query=query, enable_cross_partition_query=True))
            count = items[0] if items else 0
            
            print(f"   Documentos actuales: {count}")
            print()
            
            return container
            
        except exceptions.CosmosResourceNotFoundError:
            print(f"❌ El contenedor '{container_name}' no existe")
            print(f"   Reinicia la aplicación Flask para que se cree automáticamente")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def agregar_documentos_ejemplo(container):
    """Agrega documentos de ejemplo al contenedor"""
    
    print("📝 Agregando documentos de ejemplo...")
    print()
    
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
    
    agregados = 0
    
    for doc_data in documentos_ejemplo:
        try:
            doc_id = str(uuid.uuid4())
            documento = {
                'id': doc_id,
                'nombre': doc_data['nombre'],
                'link': doc_data['link'],
                'tipo': doc_data['tipo'],
                'orden': agregados + 1,
                'activo': True,
                'fecha_creacion': datetime.utcnow().isoformat(),
                'fecha_modificacion': datetime.utcnow().isoformat()
            }
            
            container.create_item(body=documento)
            print(f"   ✅ Agregado: {doc_data['nombre']}")
            agregados += 1
            
        except Exception as e:
            print(f"   ❌ Error al agregar '{doc_data['nombre']}': {str(e)}")
    
    print()
    print(f"✅ {agregados} documentos agregados exitosamente")
    return agregados

def listar_documentos(container):
    """Lista todos los documentos en el contenedor"""
    
    print()
    print("📋 Documentos en el contenedor:")
    print("-" * 70)
    
    try:
        query = "SELECT * FROM c ORDER BY c.orden ASC"
        documentos = list(container.query_items(query=query, enable_cross_partition_query=True))
        
        if not documentos:
            print("   (No hay documentos)")
        else:
            for doc in documentos:
                print(f"   • {doc['nombre']}")
                print(f"     Tipo: {doc['tipo']} | Link: {doc['link']}")
                print(f"     Activo: {doc.get('activo', True)} | Orden: {doc.get('orden', 0)}")
                print()
        
        return documentos
        
    except Exception as e:
        print(f"   ❌ Error al listar documentos: {str(e)}")
        return []

if __name__ == "__main__":
    container = verificar_contenedor_documentos()
    
    if container:
        # Verificar si ya hay documentos
        query = "SELECT VALUE COUNT(1) FROM c"
        items = list(container.query_items(query=query, enable_cross_partition_query=True))
        count = items[0] if items else 0
        
        if count == 0:
            print("ℹ️  El contenedor está vacío")
            respuesta = input("¿Deseas agregar documentos de ejemplo? (s/n): ")
            
            if respuesta.lower() == 's':
                agregar_documentos_ejemplo(container)
        
        listar_documentos(container)
        
        print()
        print("="*70)
        print("✅ Verificación completada")
        print("="*70)
