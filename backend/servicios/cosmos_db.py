from azure.cosmos import CosmosClient, PartitionKey, exceptions
from flask import current_app

class ServicioCosmosDB:
    """Servicio para interactuar con Azure CosmosDB"""
    
    def __init__(self):
        self.cliente = None
        self.base_datos = None
        self.contenedores = {}
    
    def inicializar(self):
        """Inicializa la conexión a CosmosDB"""
        try:
            self.cliente = CosmosClient(
                current_app.config['COSMOS_ENDPOINT'],
                current_app.config['COSMOS_KEY']
            )
            
            # Crear o obtener base de datos
            self.base_datos = self.cliente.create_database_if_not_exists(
                id=current_app.config['COSMOS_DATABASE']
            )
            
            # Crear o obtener contenedores
            self._crear_contenedores()
            
            return True
        except Exception as e:
            print(f"Error al inicializar CosmosDB: {str(e)}")
            return False
    
    def _crear_contenedores(self):
        """Crea los contenedores necesarios si no existen"""
        contenedores_config = [
            (current_app.config['COSMOS_CONTAINER_RESPUESTAS'], '/id'),
            (current_app.config['COSMOS_CONTAINER_PREGUNTAS'], '/cuestionario_id'),
            (current_app.config['COSMOS_CONTAINER_ADMINISTRADORES'], '/email'),
            # (current_app.config['COSMOS_CONTAINER_DOCUMENTOS'], '/id'),  # DEPRECATED
            (current_app.config['COSMOS_CONTAINER_CONFIGURACION'], '/tipo')
        ]
        
        for nombre, partition_key in contenedores_config:
            try:
                contenedor = self.base_datos.create_container_if_not_exists(
                    id=nombre,
                    partition_key=PartitionKey(path=partition_key)
                )
                self.contenedores[nombre] = contenedor
            except exceptions.CosmosHttpResponseError as e:
                print(f"Error al crear contenedor {nombre}: {str(e)}")
    
    def obtener_contenedor(self, nombre_contenedor):
        """Obtiene un contenedor específico"""
        return self.contenedores.get(nombre_contenedor)
    
    def crear_documento(self, nombre_contenedor, documento):
        """Crea un nuevo documento en un contenedor"""
        try:
            contenedor = self.obtener_contenedor(nombre_contenedor)
            return contenedor.create_item(body=documento)
        except exceptions.CosmosHttpResponseError as e:
            print(f"Error al crear documento: {str(e)}")
            return None
    
    def leer_documento(self, nombre_contenedor, documento_id, partition_key):
        """Lee un documento específico"""
        try:
            contenedor = self.obtener_contenedor(nombre_contenedor)
            return contenedor.read_item(item=documento_id, partition_key=partition_key)
        except exceptions.CosmosResourceNotFoundError:
            return None
        except exceptions.CosmosHttpResponseError as e:
            print(f"Error al leer documento: {str(e)}")
            return None
    
    def actualizar_documento(self, nombre_contenedor, documento):
        """Actualiza un documento existente"""
        try:
            contenedor = self.obtener_contenedor(nombre_contenedor)
            return contenedor.upsert_item(body=documento)
        except exceptions.CosmosHttpResponseError as e:
            print(f"Error al actualizar documento: {str(e)}")
            return None
    
    def eliminar_documento(self, nombre_contenedor, documento_id, partition_key):
        """Elimina un documento específico del contenedor"""
        try:
            contenedor = self.obtener_contenedor(nombre_contenedor)
            if not contenedor:
                return {'success': False, 'message': 'Contenedor no encontrado'}
                
            contenedor.delete_item(item=documento_id, partition_key=partition_key)
            return {'success': True}
            
        except exceptions.CosmosResourceNotFoundError:
            return {'success': False, 'message': 'Documento no encontrado'}
            
        except exceptions.CosmosHttpResponseError as e:
            return {'success': False, 'message': f'Error HTTP {e.status_code}: {e.message}'}
            
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def consultar_documentos(self, nombre_contenedor, consulta, parametros=None):
        """Ejecuta una consulta SQL en un contenedor"""
        try:
            contenedor = self.obtener_contenedor(nombre_contenedor)
            items = list(contenedor.query_items(
                query=consulta,
                parameters=parametros,
                enable_cross_partition_query=True
            ))
            return items
        except exceptions.CosmosHttpResponseError as e:
            print(f"Error al consultar documentos: {str(e)}")
            return []

# Instancia global del servicio
servicio_cosmos = ServicioCosmosDB()
