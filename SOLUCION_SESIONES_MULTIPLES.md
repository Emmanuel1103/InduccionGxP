# Solución: Múltiples Sesiones Creadas

## Problema
Al recargar la página se creaban 4 sesiones en lugar de 1.

## Causas

1. **React StrictMode en Desarrollo**: React 18 ejecuta los efectos dos veces en modo desarrollo para ayudar a detectar errores
2. **Múltiples Renderizados**: Sin protección, cada renderizado podía crear una nueva sesión
3. **Falta de Control de Inicialización**: No había un mecanismo para evitar re-inicializaciones

## Solución Implementada

### 1. Uso de `useRef` para Control de Inicialización
```javascript
const inicializadoRef = useRef(false)

useEffect(() => {
  if (inicializadoRef.current) return  // Evita re-ejecuciones
  
  // ... código de inicialización
  inicializadoRef.current = true
}, [])
```

### 2. Memorización del Contexto
```javascript
const value = useMemo(() => sesionData, [
  sesionData.sesion,
  sesionData.cargando,
  sesionData.error
])
```

### 3. Verificación de Sesión Existente
El código primero verifica si hay una sesión guardada en localStorage antes de crear una nueva.

## Comportamiento Actual

### En Desarrollo (con StrictMode)
- El efecto se ejecuta 2 veces por React StrictMode
- Pero solo se crea 1 sesión gracias a `useRef`
- Si ya existe una sesión en localStorage, se reutiliza

### En Producción
- El efecto se ejecuta 1 sola vez
- Se crea solo 1 sesión por usuario
- La sesión persiste entre recargas

## Para Desactivar StrictMode (Opcional)

Si deseas desactivar StrictMode en desarrollo (no recomendado):

**Archivo: `frontend/src/main.jsx`**
```jsx
// Antes (con StrictMode)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Después (sin StrictMode)
createRoot(document.getElementById('root')).render(
  <App />
)
```

⚠️ **No se recomienda** desactivar StrictMode ya que ayuda a detectar problemas potenciales.

## Verificar Funcionamiento

1. Limpia las sesiones existentes desde `/datos`
2. Recarga la aplicación
3. Verifica que solo se cree 1 sesión
4. Recarga nuevamente
5. Verifica que se reutilice la misma sesión

## Notas Adicionales

- La sesión se guarda en localStorage con clave `sesion_induccion_id`
- Para limpiar localStorage: `localStorage.clear()` en consola
- Para ver el ID actual: `localStorage.getItem('sesion_induccion_id')`
