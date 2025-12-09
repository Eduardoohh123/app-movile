# 📘 Guía de Uso - Sistema de Fichajes con API

## 🎯 Problema Resuelto

El error **429 (Too Many Requests)** significa que se ha excedido el límite de 100 consultas diarias de RapidAPI. Para evitar consumir tu cuota innecesariamente, ahora la app funciona con **dos modos**:

---

## 🔄 Modos de Operación

### 1. 📦 **Modo Demostración** (Predeterminado - Recomendado)
- ✅ **No consume consultas de API**
- ✅ Muestra 8 fichajes reales de demostración
- ✅ Funciona sin conexión a internet
- ✅ Ideal para desarrollo y pruebas
- ⚡ Carga instantánea

**Identificación Visual:**
- Banner amarillo: "Modo demostración activo"
- Icono de matraz (🧪) en el header

---

### 2. 🌐 **Modo API Real**
- ⚠️ **Consume 1 consulta por cada actualización**
- ✅ Datos reales y actualizados de API-FOOTBALL
- ✅ Caché de 5 minutos (evita consultas duplicadas)
- 📊 Límite: 100 consultas/día

**Identificación Visual:**
- Banner rojo: "Usando API real - Cada actualización consume 1 consulta"
- Icono de nube (☁️) en el header

---

## 🎮 Controles en el Header

| Icono | Función | Modo Demo | Modo API |
|-------|---------|-----------|----------|
| 🧪/☁️ | Cambiar modo | Alterna entre Demo y API | Alterna entre Demo y API |
| 🔑 | Configurar API Key | Abre modal de configuración | Abre modal de configuración |
| 🔄 | Recargar | Recarga datos demo | **Consume 1 consulta** si no hay caché |

---

## ⚙️ Cómo Cambiar de Modo

1. **Abrir la página de Fichajes**
2. **Observar el icono en el header derecho:**
   - 🧪 Matraz = Modo Demo
   - ☁️ Nube = Modo API Real
3. **Tocar el icono** para cambiar de modo
4. Los datos se recargarán automáticamente

---

## 💾 Sistema de Caché

Cuando usas el **Modo API Real**, el sistema guarda los datos en caché durante **5 minutos**.

### Beneficios del Caché:
- ✅ Si recargas la página en menos de 5 minutos → **No consume consultas**
- ✅ Si cierras y abres la app → Usa el caché si aún es válido
- ✅ Solo consume consultas cuando el caché expira

### Limpiar Caché:
- Cambiar a Modo Demo y regresar a Modo API
- O esperar 5 minutos

---

## 📊 Datos de Demostración

El **Modo Demo** incluye 8 fichajes de ejemplo:

1. **Kylian Mbappé** - PSG → Real Madrid (Gratis)
2. **Jude Bellingham** - B. Dortmund → Real Madrid (€103M)
3. **Harry Kane** - Tottenham → Bayern (€100M)
4. **Declan Rice** - West Ham → Arsenal (€116M)
5. **Moises Caicedo** - Brighton → Chelsea (€116M)
6. **Victor Osimhen** - Napoli → Man United (€120M) - _Rumor_
7. **Florian Wirtz** - Leverkusen → Bayern (€130M) - _Rumor_
8. **Erling Haaland** - Man City → Real Madrid (€180M) - _Rumor_

---

## 🔐 Configuración de API Key

### ¿Cuándo usar tu API Key propia?

Solo necesitas configurar tu propia API Key si:
- Quieres usar datos reales actualizados
- Tienes acceso a una cuenta de RapidAPI
- No has excedido tu límite de 100 consultas

### Pasos:

1. **Obtener API Key:**
   - Ir a [RapidAPI - API-FOOTBALL](https://rapidapi.com/api-sports/api/api-football/)
   - Crear cuenta gratuita (100 requests/día)
   - Copiar tu API Key

2. **Configurar en la App:**
   - Abrir página de Fichajes
   - Tocar icono de llave 🔑 en el header
   - Pegar tu API Key
   - Guardar

3. **Cambiar a Modo API Real:**
   - Tocar el icono 🧪 para cambiar a ☁️
   - Los datos se cargarán desde la API

---

## 📈 Monitoreo de Consultas

### En la Consola del Navegador (F12):

#### Modo Demo:
```
📦 Usando datos de demostración (no consume consultas de API)
```

#### Modo API (Con Caché):
```
💾 Usando datos del caché (no consume consultas de API)
```

#### Modo API (Nueva Consulta):
```
🌐 ⚠️ LLAMANDO A API-FOOTBALL (consumirá 1 consulta de tu límite)
✅ Datos recibidos de la API
```

---

## ⚠️ Solución de Problemas

### Error 429 (Too Many Requests)

**Síntoma:** Banner rojo "Límite de consultas excedido"

**Solución:**
1. Cambiar a **Modo Demo**
2. Esperar 24 horas (reset diario de RapidAPI)
3. O conseguir una API Key nueva en otra cuenta

### No se actualizan los datos

**Solución:**
1. Verificar que estás en **Modo API Real** (☁️)
2. Esperar 5 minutos para que expire el caché
3. Tocar el botón de recargar 🔄

### API Key no funciona

**Solución:**
1. Verificar que copiaste la key completa
2. Confirmar que la cuenta de RapidAPI está activa
3. Revisar límite de consultas en RapidAPI dashboard

---

## 🎯 Recomendaciones

### Para Desarrollo:
- ✅ Usa **Modo Demo** por defecto
- ✅ Solo cambia a API Real cuando necesites datos actuales
- ✅ Recuerda volver a Modo Demo después de probar

### Para Producción:
- ⚠️ Considera suscripciones de pago de RapidAPI (más consultas)
- ⚠️ Implementa autenticación de usuarios
- ⚠️ Cada usuario debería tener su propia API Key

---

## 📝 Persistencia de Configuración

La app guarda en `localStorage`:

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `use_mock_data` | `true/false` | Modo actual (Demo/API) |
| `football_api_key` | `string` | Tu API Key configurada |

Estos datos persisten entre sesiones.

---

## 🚀 Características Implementadas

- ✅ Modo demostración con datos realistas
- ✅ Sistema de caché de 5 minutos
- ✅ Indicadores visuales de modo activo
- ✅ Protección contra consumo excesivo de API
- ✅ Persistencia de configuración
- ✅ Logging detallado en consola
- ✅ Manejo elegante de errores (429, network, etc.)
- ✅ Cambio de modo con un toque

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica el modo activo (🧪 Demo / ☁️ API)
3. Confirma que tu API Key es válida
4. Revisa tu cuota en [RapidAPI Dashboard](https://rapidapi.com/developer/billing)

---

**Última actualización:** Noviembre 2025
