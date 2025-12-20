# 🔧 Solución: Error de Conexión al Servidor en APK

## 📋 Problema
Cuando ejecutas la APK en un dispositivo real, no puede conectarse al servidor porque `localhost:8080` no funciona fuera de tu PC.

## ✅ Soluciones Implementadas

### 1. Configuración de Seguridad de Red en Android
- ✅ Agregado `android:usesCleartextTraffic="true"` en AndroidManifest.xml
- ✅ Creado archivo `network_security_config.xml` para permitir HTTP en desarrollo
- ✅ Android 9+ bloquea HTTP por defecto, ahora está permitido

### 2. Configuración de Capacitor
- ✅ Agregado `cleartext: true` en capacitor.config.ts

## 🚀 Pasos para Hacer Funcionar la App

### Opción A: Usar Emulador Android
Si usas el emulador de Android Studio:
```typescript
// environment.ts - MANTENER ESTA URL
apiUrl: 'http://10.0.2.2:8080/api'
```
`10.0.2.2` es la IP especial del emulador que apunta a tu localhost.

### Opción B: Usar Dispositivo Real (RECOMENDADO)

#### 1️⃣ Encuentra tu IP local de Windows:
```powershell
ipconfig
```
Busca "IPv4 Address" en tu adaptador de red WiFi/Ethernet.
Ejemplo: `192.168.1.100`

#### 2️⃣ Actualiza environment.ts:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://TU_IP_AQUI:8080/api', // Ejemplo: http://192.168.1.100:8080/api
  firebase: { ... }
};
```

#### 3️⃣ Asegúrate que tu backend Spring Boot acepta conexiones:
```java
// En tu aplicación Spring Boot, agrega esta configuración:
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*") // En desarrollo
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

#### 4️⃣ Inicia el backend escuchando en todas las interfaces:
```bash
# En lugar de solo localhost, usa:
java -jar tu-aplicacion.jar --server.address=0.0.0.0
```

O en `application.properties`:
```properties
server.address=0.0.0.0
server.port=8080
```

#### 5️⃣ Reconstruye la APK:
```bash
# 1. Sincroniza los cambios con Android
npx cap sync android

# 2. Abre Android Studio
npx cap open android

# 3. En Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s)
```

### Opción C: Usar un Servidor en la Nube
Si tienes un servidor en producción o un servicio como Heroku, Railway, etc:

```typescript
// environment.ts
apiUrl: 'https://tu-servidor.com/api'
```

## 🔍 Verificación

### 1. Verifica que el servidor esté corriendo:
```bash
# Desde tu dispositivo, abre el navegador y visita:
http://TU_IP:8080/api
# Deberías ver una respuesta del servidor
```

### 2. Prueba la conexión desde la app:
La app ahora debería conectarse correctamente.

## ⚠️ Problemas Comunes

### "ERR_CONNECTION_REFUSED"
- ✅ Verifica que el backend esté corriendo
- ✅ Verifica que tu PC y dispositivo estén en la misma red WiFi
- ✅ Verifica que el firewall de Windows permita conexiones al puerto 8080

### "ERR_CONNECTION_TIMED_OUT"
- ✅ Verifica la IP correcta con `ipconfig`
- ✅ Desactiva temporalmente el firewall de Windows para probar
- ✅ Asegúrate de usar HTTP (no HTTPS) en desarrollo

### Firewall de Windows
Si el firewall bloquea las conexiones:
```powershell
# Abre PowerShell como Administrador y ejecuta:
netsh advfirewall firewall add rule name="Spring Boot Dev" dir=in action=allow protocol=TCP localport=8080
```

## 📱 Para Producción

Cuando vayas a producción, actualiza:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-servidor-produccion.com/api',
  firebase: { ... }
};
```

Y cambia `usesCleartextTraffic` a `false` y usa HTTPS.

---

## 💡 Nota (IPv6 / túneles)

- Si tu PC tiene una IPv6 global (ej. asignada por Cloudflare WARP) y quieres que el móvil se conecte por IPv6, activa WARP también en el móvil y usa una URL con literal IPv6 (ej: `http://[2606:4700:110:81cc:f737:3048:f4c:fc51]:8080/api`).

- Si no puedes usar WARP en el móvil, la opción más simple y robusta es exponer localmente con un túnel (ngrok o Cloudflare Tunnel) y usar la URL pública HTTPS en `environment.prod.ts` (ej: `https://abcd1234.ngrok.io/api`).

- En desarrollo, prueba primero el endpoint `/api/health/status` desde el móvil antes de intentar el login (esto evita el mensaje genérico "server error").
## 🎯 Resumen Rápido

1. **Encuentra tu IP**: `ipconfig` en PowerShell
2. **Actualiza environment.ts**: Cambia `localhost` por tu IP
3. **Configura backend**: Acepta conexiones desde 0.0.0.0
4. **Reconstruye APK**: `npx cap sync android`
5. **Prueba**: Instala y abre la app

¿Necesitas ayuda adicional? Verifica los logs de la app en Chrome DevTools:
```bash
# Con el dispositivo conectado por USB:
chrome://inspect
```
