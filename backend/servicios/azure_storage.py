from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from datetime import datetime, timedelta
from flask import current_app
import os

class ServicioAzureStorage:
    """Servicio para interactuar con Azure Blob Storage"""
    
    def __init__(self):
        self.cliente_blob = None
        self.contenedores = {}
    
    def inicializar(self):
        """Inicializa la conexión a Azure Storage"""
        try:
            connection_string = current_app.config['AZURE_STORAGE_CONNECTION_STRING']
            
            # Validar que la cadena de conexión no sea la de ejemplo
            if not connection_string or 'tu-cuenta' in connection_string or 'tu-clave' in connection_string:
                print("Azure Storage: Usando configuración de ejemplo, servicio no disponible")
                return False
            
            self.cliente_blob = BlobServiceClient.from_connection_string(connection_string)
            
            # Crear o obtener contenedores
            self._crear_contenedores()
            
            return True
        except Exception as e:
            print(f"Azure Storage: No se pudo inicializar - {str(e)}")
            self.cliente_blob = None
            return False
    
    def _crear_contenedores(self):
        """Crea los contenedores necesarios si no existen"""
        if not self.cliente_blob:
            return
            
        nombres_contenedores = [
            current_app.config['AZURE_STORAGE_CONTAINER_VIDEOS'],
            current_app.config['AZURE_STORAGE_CONTAINER_RECURSOS']
        ]
        
        for nombre in nombres_contenedores:
            try:
                contenedor = self.cliente_blob.get_container_client(nombre)
                if not contenedor.exists():
                    contenedor.create_container()
                self.contenedores[nombre] = contenedor
            except Exception as e:
                print(f"Azure Storage: No se pudo crear contenedor {nombre} - {str(e)}")
    
    def subir_archivo(self, nombre_contenedor, nombre_archivo, datos_archivo, sobrescribir=False):
        """Sube un archivo al contenedor especificado"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return None
            
            blob_cliente = contenedor.get_blob_client(nombre_archivo)
            blob_cliente.upload_blob(datos_archivo, overwrite=sobrescribir)
            
            return blob_cliente.url
        except Exception as e:
            print(f"Error al subir archivo: {str(e)}")
            return None
    
    def descargar_archivo(self, nombre_contenedor, nombre_archivo):
        """Descarga un archivo del contenedor"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return None
            
            blob_cliente = contenedor.get_blob_client(nombre_archivo)
            return blob_cliente.download_blob().readall()
        except Exception as e:
            print(f"Error al descargar archivo: {str(e)}")
            return None
    
    def eliminar_archivo(self, nombre_contenedor, nombre_archivo):
        """Elimina un archivo del contenedor"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return False
            
            blob_cliente = contenedor.get_blob_client(nombre_archivo)
            blob_cliente.delete_blob()
            return True
        except Exception as e:
            print(f"Error al eliminar archivo: {str(e)}")
            return False
    
    def listar_archivos(self, nombre_contenedor, prefijo=None):
        """Lista archivos en un contenedor"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return []
            
            blobs = contenedor.list_blobs(name_starts_with=prefijo)
            return [{'nombre': blob.name, 'tamaño': blob.size, 'ultima_modificacion': blob.last_modified} 
                   for blob in blobs]
        except Exception as e:
            print(f"Error al listar archivos: {str(e)}")
            return []
    
    def generar_url_sas(self, nombre_contenedor, nombre_archivo, duracion_horas=1):
        """Genera una URL con SAS (Shared Access Signature) para acceso temporal"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return None
            
            # Extraer información de la cadena de conexión
            connection_parts = dict(item.split('=', 1) for item in 
                                  current_app.config['AZURE_STORAGE_CONNECTION_STRING'].split(';') if '=' in item)
            
            account_name = connection_parts.get('AccountName')
            account_key = connection_parts.get('AccountKey')
            
            if not account_name or not account_key:
                return None
            
            # Generar SAS token
            sas_token = generate_blob_sas(
                account_name=account_name,
                container_name=nombre_contenedor,
                blob_name=nombre_archivo,
                account_key=account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=duracion_horas)
            )
            
            # Construir URL completa
            blob_cliente = contenedor.get_blob_client(nombre_archivo)
            url_base = blob_cliente.url.split('?')[0]
            
            return f"{url_base}?{sas_token}"
        except Exception as e:
            print(f"Error al generar URL SAS: {str(e)}")
            return None
    
    def existe_archivo(self, nombre_contenedor, nombre_archivo):
        """Verifica si un archivo existe en el contenedor"""
        try:
            contenedor = self.contenedores.get(nombre_contenedor)
            if not contenedor:
                return False
            
            blob_cliente = contenedor.get_blob_client(nombre_archivo)
            return blob_cliente.exists()
        except Exception as e:
            print(f"Error al verificar existencia de archivo: {str(e)}")
            return False

# Instancia global del servicio
servicio_storage = ServicioAzureStorage()
