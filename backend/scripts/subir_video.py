"""
Script simplificado para subir el video de inducción a Azure Storage
"""
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def subir_video():
    """Sube el video de inducción a Azure Storage"""
    
    # Ruta del video (hardcodeada)
    video_path = r"C:\Users\aprendizprocesos\OneDrive - Fundación Mario Santo Domingo\Documentos\Visual Studio Code\InduccionGxP\InduccionGxP\frontend\src\assets\media\induccion_procesos.mp4"
    
    # Obtener connection string
    connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    
    if not connection_string:
        print("❌ Error: AZURE_STORAGE_CONNECTION_STRING no está configurado en .env")
        return
    
    if not os.path.exists(video_path):
        print(f"❌ Error: El archivo no existe en: {video_path}")
        return
    
    try:
        print("🔄 Conectando a Azure Storage...")
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        
        container_name = "videoinduccion"
        video_filename = "induccion_procesos.mp4"
        
        # Obtener contenedor
        container_client = blob_service_client.get_container_client(container_name)
        
        print(f"🔄 Subiendo '{video_filename}' a Azure Storage...")
        print("⏳ Esto puede tomar varios minutos...")
        
        # Subir video
        blob_client = container_client.get_blob_client(video_filename)
        
        with open(video_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        
        print(f"✅ Video subido exitosamente!")
        
        # Generar URL con SAS token
        print(f"\n🔐 Generando URL segura...")
        
        connection_parts = dict(item.split('=', 1) for item in connection_string.split(';') if '=' in item)
        account_name = connection_parts.get('AccountName')
        account_key = connection_parts.get('AccountKey')
        
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=video_filename,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(days=3650)
        )
        
        video_url = f"{blob_client.url}?{sas_token}"
        
        print(f"\n✅ ¡Listo!")
        print(f"\n📋 URL del video (válida por 10 años):")
        print(f"\n{video_url}\n")
        
        # Guardar URL
        with open("video_url.txt", "w") as f:
            f.write(video_url)
        
        print(f"💾 URL guardada en: video_url.txt")
        print(f"\n📝 Copia esta URL y pégala en la configuración de inducción")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    print("=" * 70)
    print("  Subir Video de Inducción a Azure Storage")
    print("=" * 70)
    print()
    subir_video()
    print()
    print("=" * 70)
