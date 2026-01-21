"""
Script para configurar Azure Storage y subir el video de inducción
"""
from azure.storage.blob import BlobServiceClient, PublicAccess
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def crear_contenedor_y_subir_video():
    """Crea el contenedor videoinduccion y sube el video"""
    
    # Obtener connection string
    connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    
    if not connection_string:
        print("❌ Error: AZURE_STORAGE_CONNECTION_STRING no está configurado en .env")
        print("\nAgrega esta línea a tu archivo .env:")
        print("AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net")
        return
    
    try:
        # Crear cliente de blob storage
        print("🔄 Conectando a Azure Storage...")
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        
        # Nombre del contenedor
        container_name = "videoinduccion"
        
        # Crear contenedor si no existe
        print(f"🔄 Creando contenedor '{container_name}'...")
        try:
            container_client = blob_service_client.create_container(container_name)
            print(f"✅ Contenedor '{container_name}' creado exitosamente (acceso privado)")
        except Exception as e:
            if "ContainerAlreadyExists" in str(e):
                print(f"ℹ️  Contenedor '{container_name}' ya existe")
                container_client = blob_service_client.get_container_client(container_name)
            else:
                raise e
        
        # Solicitar ruta del video
        print("\n📹 Ahora necesitas subir tu video de inducción")
        print("Ingresa la ruta completa del archivo de video (ej: C:\\Videos\\induccion.mp4)")
        video_path = input("Ruta del video: ").strip().strip('"')
        
        if not os.path.exists(video_path):
            print(f"❌ Error: El archivo '{video_path}' no existe")
            return
        
        # Obtener nombre del archivo
        video_filename = os.path.basename(video_path)
        
        # Subir video
        print(f"\n🔄 Subiendo '{video_filename}' a Azure Storage...")
        print("⏳ Esto puede tomar varios minutos dependiendo del tamaño del archivo...")
        
        blob_client = container_client.get_blob_client(video_filename)
        
        with open(video_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        
        # Generar URL con SAS token (válida por 10 años)
        from azure.storage.blob import generate_blob_sas, BlobSasPermissions
        from datetime import datetime, timedelta
        
        print(f"\n🔐 Generando URL segura con SAS token...")
        
        # Extraer información del connection string
        connection_parts = dict(item.split('=', 1) for item in connection_string.split(';') if '=' in item)
        account_name = connection_parts.get('AccountName')
        account_key = connection_parts.get('AccountKey')
        
        # Generar SAS token válido por 10 años
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=video_filename,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(days=3650)  # 10 años
        )
        
        # Construir URL completa con SAS
        video_url = f"{blob_client.url}?{sas_token}"
        
        print(f"\n✅ ¡Video subido exitosamente!")
        print(f"\n📋 URL del video (con SAS token, válida por 10 años):")
        print(f"   {video_url}")
        
        print(f"\n📝 Próximo paso:")
        print(f"   1. Copia la URL de arriba")
        print(f"   2. Ve a la página de Configuración en tu aplicación")
        print(f"   3. Pega la URL en el campo 'URL del Video'")
        print(f"   4. Guarda los cambios")
        
        # Guardar URL en un archivo para referencia
        with open("video_url.txt", "w") as f:
            f.write(video_url)
        print(f"\n💾 URL guardada en: video_url.txt")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nVerifica que:")
        print("  - El connection string sea correcto")
        print("  - Tengas permisos para crear contenedores")
        print("  - La cuenta de storage esté activa")

if __name__ == "__main__":
    print("=" * 60)
    print("  Setup de Azure Storage para Video de Inducción")
    print("=" * 60)
    print()
    crear_contenedor_y_subir_video()
    print()
    print("=" * 60)
