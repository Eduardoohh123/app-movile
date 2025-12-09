# Configuración de API-FOOTBALL para Football Scoop

## 📋 Pasos para configurar la API

### 1. Obtener API Key de RapidAPI

1. Ve a [RapidAPI - API-FOOTBALL](https://rapidapi.com/api-sports/api/api-football)
2. Crea una cuenta gratuita o inicia sesión
3. Suscríbete al plan **Free** (100 requests/día gratis)
4. Copia tu **API Key** desde el dashboard

### 2. Configurar la API Key en la aplicación

Abre el archivo `src/app/services/football-api.service.ts` y reemplaza:

```typescript
private apiKey = 'TU_API_KEY_AQUI'; // ← Pega aquí tu API key
```

Por ejemplo:
```typescript
private apiKey = 'abc123xyz456def789ghi012jkl345mno678pqr901stu234';
```

### 3. Endpoints disponibles

La API ya está configurada para usar:

- **Fichajes/Transfers**: `/v3/transfers` - Obtiene los últimos traspasos
- **Jugadores**: `/v3/players` - Información detallada de jugadores
- **Equipos**: `/v3/teams` - Datos de clubes con logos

### 4. Características implementadas

✅ **Integración automática**: Los datos se cargan al abrir la página
✅ **Fallback system**: Si la API falla, usa datos mock
✅ **Filtros funcionales**: Por estado (todos, confirmados, rumores)
✅ **Botón de actualización**: Recarga datos desde la API
✅ **Transformación de datos**: Convierte respuesta API al formato de la app
✅ **Traducciones**: Posiciones y fechas en español
✅ **Banderas**: Emojis de banderas por nacionalidad

### 5. Límites del plan gratuito

- **100 requests por día**
- Datos actualizados en tiempo real
- Acceso a todas las ligas principales
- Fotos de jugadores y logos de clubes

### 6. Estructura de datos

La API transforma automáticamente los datos de API-FOOTBALL a:

```typescript
{
  id: number,
  playerName: string,
  playerPhoto: string,
  position: string,        // Traducido al español
  age: number,
  nationality: string,     // Con emoji de bandera
  fromClub: string,
  fromClubLogo: string,
  toClub: string,
  toClubLogo: string,
  fee: string,            // Formateado con €
  status: string,         // confirmado/rumor/negociando
  date: string            // Formato: "15 Enero 2024"
}
```

### 7. Funcionamiento

1. Al cargar la página, llama a `loadTransfers()`
2. Si la API responde: muestra datos reales
3. Si la API falla: muestra datos mock (8 fichajes de ejemplo)
4. El usuario puede filtrar por estado
5. Botón "Actualizar fichajes" recarga desde la API

### 8. Próximos pasos opcionales

- Agregar más temporadas (2023, 2022)
- Implementar búsqueda de jugadores
- Mostrar estadísticas del jugador
- Agregar notificaciones de nuevos fichajes
- Cache local para reducir llamadas a la API

---

## 🚀 ¡Listo para usar!

Una vez configurada tu API Key, la aplicación cargará automáticamente los fichajes reales desde API-FOOTBALL.
