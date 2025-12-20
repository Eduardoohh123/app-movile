# 🚀 Inicio Rápido: Conectar Ionic con Spring Boot

## ✅ Lo que ya está configurado:

1. ✔️ Variables de entorno ([environment.ts](src/environments/environment.ts), [environment.prod.ts](src/environments/environment.prod.ts))
2. ✔️ Servicio API base ([api.service.ts](src/app/services/api.service.ts))
3. ✔️ Interceptor HTTP ([http.interceptor.ts](src/app/interceptors/http.interceptor.ts))
4. ✔️ Servicio de ejemplo ([news-backend.service.ts](src/app/services/news-backend.service.ts))
5. ✔️ Ejemplos de Spring Boot ([spring-boot-examples.java](spring-boot-examples.java))

---

## 🎯 Pasos para probar la conexión:

### 1. Configurar Spring Boot

En tu proyecto Spring Boot, crea los siguientes archivos:

- **CorsConfig.java** - Configuración de CORS (ver [spring-boot-examples.java](spring-boot-examples.java))
- **NewsController.java** - Controlador REST
- **HealthController.java** - Para verificar conexión

### 2. Iniciar el backend

```bash
cd tu-proyecto-spring-boot
./mvnw spring-boot:run
# o
./gradlew bootRun
```

Verifica que esté corriendo en: http://localhost:8080

### 3. Iniciar Ionic

```bash
ionic serve
```

O con npm:
```bash
npm start
```

### 4. Probar la conexión

Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('http://localhost:8080/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend conectado:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

## 🔧 Usar los servicios en tu app

### Opción 1: Usar el servicio existente

Si ya tienes un componente que usa noticias, actualiza el servicio:

```typescript
// En tu componente
import { NewsService } from '../services/news-backend.service';

constructor(private newsService: NewsService) {}

ngOnInit() {
  this.newsService.getNews().subscribe({
    next: (news) => {
      console.log('Noticias:', news);
      this.news = news;
    },
    error: (err) => {
      console.error('Error:', err);
    }
  });
}
```

### Opción 2: Crear tu propio servicio

```typescript
// mi-servicio.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MiServicioService {
  
  constructor(private api: ApiService) {}
  
  obtenerDatos() {
    return this.api.get('/mi-endpoint');
  }
  
  crearDato(data: any) {
    return this.api.post('/mi-endpoint', data);
  }
}
```

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar con el servidor"

1. Verifica que Spring Boot esté corriendo:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Revisa la URL en [environment.ts](src/environments/environment.ts):
   ```typescript
   apiUrl: 'http://localhost:8080/api'
   ```

### Error: CORS

En Spring Boot, asegúrate de tener la configuración de CORS:

```java
@CrossOrigin(origins = "http://localhost:8100")
```

O la configuración global en `CorsConfig.java`.

### Error 401: No autorizado

Si implementas autenticación, asegúrate de:
1. Guardar el token después del login
2. El interceptor lo añade automáticamente

---

## 📱 Para probar en dispositivo móvil

### 1. Obtén tu IP local

**Windows:**
```powershell
ipconfig
# Busca: IPv4 Address
```

**Mac/Linux:**
```bash
ifconfig
# Busca: inet
```

### 2. Actualiza environment.ts

```typescript
apiUrl: 'http://192.168.1.X:8080/api'  // Usa tu IP
```

### 3. Compila para Android/iOS

```bash
ionic cap build android
ionic cap open android
```

---

## 📚 Documentación completa

Ver [SPRING_BOOT_INTEGRATION.md](SPRING_BOOT_INTEGRATION.md) para:
- Guía completa de configuración
- Implementación de autenticación JWT
- Ejemplos de todos los métodos HTTP
- Manejo de errores avanzado
- Configuración para producción

---

## 🎨 Estructura de archivos creados

```
src/
├── environments/
│   ├── environment.ts          ← URL del backend (desarrollo)
│   └── environment.prod.ts     ← URL del backend (producción)
├── app/
│   ├── services/
│   │   ├── api.service.ts             ← Servicio base HTTP
│   │   └── news-backend.service.ts    ← Ejemplo de uso
│   └── interceptors/
│       └── http.interceptor.ts        ← Manejo automático de tokens
└── main.ts                     ← Configuración del interceptor
```

---

## ⚡ Comandos útiles

```bash
# Desarrollo
ionic serve

# Build para producción
ionic build --prod

# Compilar para Android
ionic cap build android

# Compilar para iOS
ionic cap build ios

# Agregar plataforma
ionic cap add android
ionic cap add ios

# Sincronizar cambios
ionic cap sync
```

---

## 💡 Próximos pasos

1. [ ] Implementa autenticación JWT
2. [ ] Crea más endpoints en Spring Boot
3. [ ] Adapta tus servicios existentes
4. [ ] Implementa caché local
5. [ ] Añade manejo offline

¡Todo listo para empezar a desarrollar! 🎉
