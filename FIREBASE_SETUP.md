# 🔥 Configuración de Firebase Realtime Database

## ✅ Conexión Configurada

Tu app ahora está conectada a:
```
https://app-mobile-2025-b833b-default-rtdb.firebaseio.com/
```

## 🔐 Configurar Reglas de Seguridad

Para que tu aplicación pueda leer y escribir en la base de datos, necesitas configurar las reglas de seguridad en Firebase Console.

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **app-mobile-2025-b833b**
3. En el menú lateral, busca **Realtime Database**
4. Click en la pestaña **Reglas** (Rules)

### Paso 2: Configurar Reglas de Desarrollo (Temporal)

Para desarrollo, puedes usar estas reglas (⚠️ **NO usar en producción**):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Paso 3: Reglas de Producción Recomendadas

Para producción, usa estas reglas que requieren autenticación:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || auth != null",
        ".write": "$uid === auth.uid || auth != null"
      }
    },
    "bets": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$betId": {
        ".validate": "newData.hasChildren(['userId', 'matchName', 'betType', 'odds', 'stake', 'status'])"
      }
    },
    "leagues": {
      ".read": true,
      ".write": "auth != null"
    },
    "teams": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 📊 Estructura de Datos en Realtime Database

Tu base de datos tendrá esta estructura:

```
app-mobile-2025-b833b-default-rtdb/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── name: string
│       ├── email: string
│       ├── avatar: string
│       ├── balance: number
│       ├── joinDate: string (ISO)
│       └── firebaseUid: string
├── bets/
│   └── {betId}/
│       ├── userId: string
│       ├── matchName: string
│       ├── betType: string
│       ├── odds: number
│       ├── stake: number
│       ├── potentialWin: number
│       ├── status: string
│       ├── placedAt: string (ISO)
│       └── ...
├── leagues/
│   └── {leagueId}/
│       ├── name: string
│       ├── country: string
│       ├── logo: string
│       ├── status: string
│       ├── createdAt: string (ISO)
│       └── ...
└── teams/
    └── {teamId}/
        ├── name: string
        ├── league: string
        ├── logo: string
        ├── country: string
        ├── createdAt: string (ISO)
        └── ...
```

## 🚀 Probar la Conexión

1. **Inicia la aplicación**:
   ```bash
   ionic serve
   ```

2. **Abre la consola del navegador** (F12)

3. **Verifica los logs**:
   - Deberías ver: `🔥 Firebase Service inicializado`
   - Deberías ver: `📊 Realtime Database URL: https://app-mobile-2025-b833b-default-rtdb.firebaseio.com`

4. **Crea un usuario o apuesta**:
   - Ve al Admin Panel (`/admin`)
   - Crea un usuario o apuesta
   - Deberías ver logs: `✅ Usuario creado en Realtime Database: {id}`

5. **Verifica en Firebase Console**:
   - Ve a Realtime Database → Datos
   - Deberías ver aparecer los nodos: `users/`, `bets/`, etc.

## 🔍 Verificar Datos en Firebase

Para ver los datos en Firebase Console:
1. Ve a **Realtime Database** → **Datos**
2. Deberías ver la estructura de árbol con tus datos
3. Puedes expandir cada nodo para ver los detalles

## 🐛 Solución de Problemas

### Error: "Permission Denied"
- ✅ Verifica que las reglas de seguridad permitan escritura
- ✅ Para desarrollo, usa las reglas temporales (`.read: true, .write: true`)
- ✅ Publica las reglas haciendo click en "Publicar"

### No se guardan los datos
- ✅ Verifica la consola del navegador para errores
- ✅ Asegúrate de que el usuario esté autenticado (`isAuthenticated()` debe retornar true)
- ✅ Verifica que la URL de la base de datos sea correcta en `environment.ts`

### Datos no aparecen en la UI
- ✅ Verifica que el usuario esté autenticado
- ✅ Los datos solo se sincronizan con Firebase para usuarios autenticados
- ✅ El usuario por defecto (`usuario@example.com`) es tratado como invitado
- ✅ Implementa el login para probar la sincronización con Firebase

## 📝 Notas Importantes

1. **Fechas**: Todas las fechas se guardan como strings ISO (`toISOString()`) y se convierten automáticamente a objetos `Date` al leer.

2. **IDs**: Los IDs se generan automáticamente usando `push()` de Firebase, lo que garantiza IDs únicos y ordenados cronológicamente.

3. **Sync Local + Cloud**: La app usa **Capacitor Preferences** para almacenamiento local y **Firebase Realtime Database** para sincronización en la nube.

4. **Autenticación**: Solo usuarios autenticados sincronizan con Firebase. Los usuarios invitados solo usan almacenamiento local.

## 🎯 Siguiente Paso

Ahora que Firebase Realtime Database está configurado:
1. ✅ Configura las reglas de seguridad en Firebase Console
2. ✅ Implementa la funcionalidad de login/registro
3. ✅ Prueba la sincronización creando datos desde la app
4. ✅ Verifica que los datos aparezcan en Firebase Console
