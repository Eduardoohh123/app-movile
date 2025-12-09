# 📍 Guía de Geolocalización con Autocompletado y Coordenadas

## 🎯 Nueva Funcionalidad Implementada

Se ha agregado un **sistema completo de geolocalización** en la sección de **Comunidad** al crear nuevas publicaciones. Ahora puedes:

- ✅ Buscar lugares, comunas y regiones escribiendo
- ✅ Obtener tu ubicación actual automáticamente
- ✅ Ver sugerencias de lugares cercanos
- ✅ Autocompletado inteligente mientras escribes
- ✅ **NUEVO**: Ver las coordenadas geográficas (latitud y longitud) del lugar seleccionado

---

## 🚀 Cómo Usar la Geolocalización

### 1. **Abrir Nueva Publicación**

1. Ve a la sección **Comunidad**
2. Toca el botón **+** (FAB azul en la esquina inferior derecha)
3. Se abrirá el modal de "Nueva Publicación"

---

### 2. **Agregar Ubicación - 3 Formas**

#### **Opción A: Ubicación Actual Automática** 📍

1. Toca el botón **"Ubicación"** en la barra de herramientas
2. Aparecerá el selector de ubicación
3. Toca **"Ubicación Actual"**
4. La app solicitará permisos de geolocalización (acéptalos)
5. ¡Listo! Tu ubicación actual se agregará automáticamente

**Ejemplo de resultado:**
```
Av. Libertador Bernardo O'Higgins 1300, Santiago, Región Metropolitana, Chile
```

---

#### **Opción B: Buscar Lugar Manualmente** 🔍

1. Toca el botón **"Ubicación"**
2. En el cuadro de búsqueda, escribe el nombre del lugar:
   - Nombre de calle o dirección
   - Comuna (ej: "Las Condes", "Providencia")
   - Región (ej: "Valparaíso", "Concepción")
   - Lugar conocido (ej: "Estadio Nacional", "Mall Plaza")

3. **Mientras escribes**, aparecerán sugerencias automáticas
4. Toca la sugerencia que quieras seleccionar
5. ¡Listo! La ubicación se agregará a tu publicación

**Ejemplo de búsqueda:**
```
Buscar: "Santiago Bernabéu"
Resultado: Santiago Bernabéu, Madrid, España
```

---

#### **Opción C: Lugares Cercanos** 🏟️

1. Toca el botón **"Ubicación"**
2. Toca **"Lugares Cercanos"**
3. La app buscará lugares deportivos, estadios y sitios de interés cercanos (radio de 10km)
4. Selecciona el lugar que quieras de la lista
5. ¡Listo! La ubicación se agregará

**Ejemplo de lugares encontrados:**
```
- Estadio Nacional
- Estadio Monumental
- Centro Deportivo Municipal
- Arena Santiago
```

---

## 🎨 Interfaz Visual

### **Selector de Ubicación**

Cuando abres el selector, verás:

```
┌─────────────────────────────────────┐
│  ← Seleccionar Ubicación            │
├─────────────────────────────────────┤
│  🔍 Buscar lugar, comuna, región... │
├─────────────────────────────────────┤
│  [Ubicación Actual] [Lugares Cercanos] │
├─────────────────────────────────────┤
│  📍 Santiago, Región Metropolitana  │
│     Chile, América del Sur           │
│                                     │
│  📍 Providencia, Santiago           │
│     Región Metropolitana, Chile      │
│                                     │
│  📍 Las Condes, Santiago            │
│     Región Metropolitana, Chile      │
└─────────────────────────────────────┘
```

---

## 📋 Características del Sistema

### **1. Autocompletado Inteligente**
- Sugerencias en tiempo real mientras escribes
- Mínimo 3 caracteres para activar búsqueda
- Prioriza resultados cercanos a tu ubicación
- Hasta 10 sugerencias por búsqueda

### **2. Ubicación Actual**
- Usa GPS del dispositivo para máxima precisión
- Solicita permisos de ubicación automáticamente
- Convierte coordenadas en dirección legible
- Muestra: calle, comuna, ciudad, región, país

### **3. Lugares Cercanos**
- Busca en un radio de 10km
- Prioriza estadios y lugares deportivos
- Muestra nombre completo y dirección
- Ordena por relevancia

### **4. Formato de Direcciones**
Las direcciones se muestran en formato legible:
```
Formato corto: Calle, Comuna, Ciudad
Formato completo: Calle Número, Comuna, Ciudad, Región, País
```

---

## 🔐 Permisos Requeridos

### **Geolocalización (GPS)**

La app necesita permisos de ubicación para:
- Obtener tu ubicación actual
- Buscar lugares cercanos
- Priorizar resultados relevantes

**¿Cómo otorgar permisos?**

1. **Primera vez**: La app solicitará permisos automáticamente
2. **Si denegaste**: Ve a Configuración del dispositivo
   - Android: Configuración → Aplicaciones → Football Scoop → Permisos → Ubicación → Permitir
   - iOS: Configuración → Football Scoop → Ubicación → Mientras se usa la app

---

## 🌐 API Utilizada

### **OpenStreetMap Nominatim**

- **Gratuita**: Sin límites de consultas para uso personal
- **Sin API Key**: No necesitas configurar nada
- **Global**: Funciona en todo el mundo
- **En español**: Resultados en idioma español

**Endpoints utilizados:**
- `search`: Búsqueda de lugares por texto
- `reverse`: Convertir coordenadas en dirección

---

## 💡 Consejos de Uso

### **Para Mejores Resultados de Búsqueda:**

✅ **SÍ - Escribe:**
- Nombres completos: "Estadio Nacional de Chile"
- Comunas: "Las Condes", "Providencia"
- Direcciones: "Av. Libertador 1234"
- Lugares conocidos: "Mall Plaza Vespucio"

❌ **NO - Evita:**
- Abreviaciones: "Est. Nal." (usa "Estadio Nacional")
- Errores ortográficos: "Santyago" (usa "Santiago")
- Muy genérico: "calle" (especifica la calle)

---

### **Ubicación Actual vs Manual:**

| Método | Cuándo Usar | Ventajas | Desventajas |
|--------|-------------|----------|-------------|
| **Ubicación Actual** | Estás en el lugar | Automático, preciso | Requiere GPS activo |
| **Buscar Manual** | Conoces el nombre | Flexible, sin GPS | Requiere escribir |
| **Lugares Cercanos** | Explorar alrededor | Descubre lugares | Necesita ubicación |

---

## 🎯 Casos de Uso

### **Ejemplo 1: Publicar desde el Estadio**
```
1. Estás en el Estadio Nacional
2. Crear nueva publicación
3. Tocar "Ubicación" → "Ubicación Actual"
4. Resultado: "Estadio Nacional, Ñuñoa, Santiago"
             "33.465278°S, 70.610556°O"
5. Publicar: "¡Increíble partido! ⚽"
```

### **Ejemplo 2: Compartir Lugar Favorito**
```
1. Quieres recomendar un bar deportivo
2. Crear nueva publicación
3. Tocar "Ubicación" → Buscar "Bar Estadio Las Condes"
4. Seleccionar de las sugerencias
5. Ver ubicación: "Bar Estadio, Las Condes"
                  "33.410000°S, 70.550000°O"
6. Publicar: "Mejor lugar para ver partidos 🍺"
```

### **Ejemplo 3: Encontrar Lugares Cercanos**
```
1. Estás en una ciudad nueva
2. Crear nueva publicación
3. Tocar "Ubicación" → "Lugares Cercanos"
4. Ver lista de estadios y centros deportivos con coordenadas
5. Seleccionar uno (ejemplo: "Estadio Monumental")
6. Ver: "Estadio Monumental, Macul, Santiago"
        "33.495833°S, 70.606389°O"
7. Publicar
```

---

## 🔧 Solución de Problemas

### ❌ **"No se pudo obtener la ubicación"**

**Solución:**
1. Verifica que el GPS esté activado
2. Otorga permisos de ubicación en Configuración
3. Asegúrate de tener conexión a internet
4. Intenta de nuevo o usa búsqueda manual

---

### ❌ **"No se encontraron lugares"**

**Solución:**
1. Verifica la ortografía del término de búsqueda
2. Usa nombres más específicos
3. Prueba con el nombre de la comuna o ciudad
4. Intenta "Ubicación Actual" o "Lugares Cercanos"

---

### ❌ **"Permisos de ubicación denegados"**

**Solución:**
1. Ve a Configuración del dispositivo
2. Busca la app "Football Scoop"
3. Activa permisos de Ubicación
4. Reinicia la app
5. Intenta nuevamente

---

## 📊 Datos Técnicos

### **Precisión de GPS:**
- **Alta precisión**: ±10-50 metros (con GPS activo)
- **Media precisión**: ±50-500 metros (con WiFi/datos)
- **Baja precisión**: ±500+ metros (solo red móvil)

### **Tiempos de Respuesta:**
- Ubicación actual: 2-5 segundos
- Búsqueda de lugares: 1-2 segundos
- Lugares cercanos: 2-4 segundos

### **Caché:**
- Las búsquedas se guardan en caché
- Máximo 20 búsquedas recientes
- Mejora velocidad de búsquedas repetidas

---

## 🎨 Personalización

La ubicación seleccionada aparecerá en tu publicación como:

```
📍 Santiago, Región Metropolitana, Chile
   33.448890°S, 70.669265°O
```

**Chip violeta con:**
- Icono de ubicación
- Texto de la dirección
- Coordenadas geográficas en formato legible (ej: 33.448890°S, 70.669265°O)
- Botón para eliminar (X)

### **Formato de Coordenadas:**

Las coordenadas se muestran en formato **grados decimales** con **6 decimales de precisión** y **direcciones cardinales**:

- **Latitud**: N (Norte) o S (Sur)
- **Longitud**: E (Este) u O (Oeste)

**Ejemplos:**
- `33.448890°S, 70.669265°O` - Santiago, Chile
- `40.416775°N, 3.703790°O` - Madrid, España
- `19.432608°N, 99.133209°O` - Ciudad de México, México

**Precisión:** 6 decimales = ~0.1 metros de precisión

---

## 📊 Datos Guardados

Cada publicación con ubicación guarda:
- **Dirección formateada**: Texto legible del lugar
- **Coordenadas**: Latitud y longitud exactas
- **Formato**: Compatible con Google Maps, Apple Maps y otras apps de mapas

**Uso futuro:**
- Compartir ubicación en otras apps
- Abrir en mapas con un toque
- Calcular distancias entre publicaciones
- Filtrar publicaciones por proximidad

---

## 📱 Compatibilidad

- ✅ **Android**: 100% funcional (GPS, búsqueda, lugares cercanos)
- ✅ **iOS**: 100% funcional (GPS, búsqueda, lugares cercanos)
- ✅ **Web/PWA**: Funcional (usa geolocalización del navegador)

---

## 🚀 Próximas Mejoras

- [ ] Historial de ubicaciones recientes
- [ ] Favoritos de lugares
- [ ] Compartir ubicación en tiempo real
- [ ] Mapa interactivo
- [ ] Filtros por categoría (bares, restaurantes, estadios)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía completa
2. Verifica permisos de ubicación
3. Asegúrate de tener conexión a internet
4. Actualiza la app a la última versión

---

**¡Disfruta compartiendo tus experiencias deportivas con ubicación! ⚽📍**
