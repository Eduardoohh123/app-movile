# Guía de Integración Spring Boot - Ionic

## 📋 Configuración completada

### ✅ Archivos modificados/creados:

1. **`src/environments/environment.ts`** - Variables de entorno para desarrollo
2. **`src/environments/environment.prod.ts`** - Variables de entorno para producción
3. **`src/app/services/api.service.ts`** - Servicio base para comunicación HTTP
4. **`src/app/services/news-backend.service.ts`** - Ejemplo de servicio conectado al backend

---

## 🚀 Paso 1: Configurar CORS en Spring Boot

Debes habilitar CORS en tu backend Spring Boot para permitir peticiones desde Ionic:

### Opción A: Configuración Global (Recomendado)

Crea una clase de configuración:

```java
package com.tuapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales
        config.setAllowCredentials(true);
        
        // Orígenes permitidos (desarrollo)
        config.addAllowedOrigin("http://localhost:8100");
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("capacitor://localhost");
        config.addAllowedOrigin("ionic://localhost");
        config.addAllowedOrigin("http://localhost");
        
        // Headers permitidos
        config.addAllowedHeader("*");
        
        // Métodos HTTP permitidos
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("OPTIONS");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Opción B: Anotación @CrossOrigin en Controllers

```java
@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = {"http://localhost:8100", "capacitor://localhost"})
public class NewsController {
    // Tu código aquí
}
```

---

## 🔧 Paso 2: Verificar el puerto del backend

En tu `application.properties` o `application.yml`:

```properties
# application.properties
server.port=8080
server.servlet.context-path=/api

# Opcional: Logging para debug
logging.level.org.springframework.web=DEBUG
```

O en YAML:

```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    org.springframework.web: DEBUG
```

---

## 📝 Paso 3: Crear Controllers en Spring Boot

### Ejemplo: NewsController

```java
package com.tuapp.controller;

import com.tuapp.model.News;
import com.tuapp.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {
    
    @Autowired
    private NewsService newsService;
    
    @GetMapping
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<News>> getNewsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(newsService.getNewsByCategory(category));
    }
    
    @PostMapping
    public ResponseEntity<News> createNews(@RequestBody News news) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(newsService.createNews(news));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody News news) {
        return ResponseEntity.ok(newsService.updateNews(id, news));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(newsService.getCategories());
    }
}
```

### Modelo de ejemplo: News.java

```java
package com.tuapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
public class News {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String summary;
    
    private String image;
    
    private String category;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

---

## 💻 Paso 4: Usar los servicios en tu app Ionic

### En tu componente:

```typescript
import { Component, OnInit } from '@angular/core';
import { NewsService } from '../services/news-backend.service';
import { News } from '../services/news-backend.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
})
export class NewsPage implements OnInit {
  news: News[] = [];
  loading = false;
  error: string = '';

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.error = '';
    
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.news = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error('Error al cargar noticias:', err);
      }
    });
  }

  createNews(newsData: Omit<News, 'id'>) {
    this.newsService.createNews(newsData).subscribe({
      next: (newNews) => {
        console.log('Noticia creada:', newNews);
        this.loadNews(); // Recargar lista
      },
      error: (err) => {
        console.error('Error al crear noticia:', err);
      }
    });
  }
}
```

---

## 🔐 Paso 5: Implementar autenticación (opcional)

### En Spring Boot:

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Validar credenciales
        String token = jwtService.generateToken(request.getUsername());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
```

### En Ionic:

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private apiService: ApiService) {}
  
  login(username: string, password: string) {
    return this.apiService.post<{token: string}>('/auth/login', {
      username,
      password
    }).pipe(
      tap(response => {
        this.apiService.setAuthToken(response.token);
      })
    );
  }
  
  logout() {
    this.apiService.clearAuthToken();
  }
}
```

---

## 🧪 Paso 6: Probar la conexión

### 1. Inicia tu backend Spring Boot:
```bash
./mvnw spring-boot:run
# o
./gradlew bootRun
```

### 2. Inicia tu app Ionic:
```bash
ionic serve
```

### 3. Verifica que puedes acceder:
- Backend: http://localhost:8080/api/health
- Frontend: http://localhost:8100

---

## 📱 Paso 7: Configuración para dispositivos móviles

Cuando compiles para Android/iOS, necesitas actualizar la URL:

### En `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  // Usa la IP de tu máquina en la red local para pruebas
  apiUrl: 'http://192.168.1.X:8080/api',
  // O tu servidor en producción
  // apiUrl: 'https://api.tudominio.com/api'
};
```

### Para obtener tu IP local:

**Windows:**
```powershell
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

---

## 🔍 Troubleshooting

### Problema: Error de CORS

**Solución:** Verifica la configuración de CORS en Spring Boot y asegúrate de incluir todos los orígenes necesarios.

### Problema: "Cannot connect to backend"

**Solución:** 
1. Verifica que el backend esté corriendo
2. Comprueba la URL en `environment.ts`
3. Revisa el firewall de tu sistema

### Problema: Error 401 Unauthorized

**Solución:** Verifica que el token JWT esté siendo enviado correctamente en los headers.

### Problema: Timeout en peticiones

**Solución:** Aumenta el timeout en `api.service.ts` o revisa el rendimiento del backend.

---

## 📚 Recursos adicionales

- [Spring Boot CORS Documentation](https://spring.io/guides/gs/rest-service-cors/)
- [Ionic HTTP Guide](https://ionicframework.com/docs/angular/your-first-app/creating-photo-gallery-device-storage)
- [Angular HttpClient](https://angular.io/guide/http)

---

## ✅ Checklist de integración

- [ ] CORS configurado en Spring Boot
- [ ] Variables de entorno configuradas en Ionic
- [ ] ApiService creado y configurado
- [ ] Servicios adaptados para usar ApiService
- [ ] Backend corriendo en puerto 8080
- [ ] Ionic corriendo en puerto 8100
- [ ] Pruebas de conexión exitosas
- [ ] Manejo de errores implementado
- [ ] Autenticación configurada (si aplica)
- [ ] Configuración para móviles actualizada

---

## 🎯 Próximos pasos

1. Implementa los demás servicios siguiendo el patrón de `news-backend.service.ts`
2. Configura autenticación JWT si es necesario
3. Implementa interceptores para logging
4. Añade caché local con Capacitor Storage
5. Configura manejo offline con Service Workers
