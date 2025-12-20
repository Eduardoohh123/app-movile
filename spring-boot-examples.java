// Ejemplos de código Spring Boot para tu backend

// ============================================
// 1. CONFIGURACIÓN DE CORS
// ============================================

// CorsConfig.java
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
        
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:8100");
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("capacitor://localhost");
        config.addAllowedOrigin("ionic://localhost");
        config.addAllowedOrigin("http://localhost");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}

// ============================================
// 2. MODELO DE DATOS
// ============================================

// News.java
package com.tuapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
public class News {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(length = 1000)
    private String summary;
    
    private String image;
    
    private String category;
    
    @Column(name = "time")
    private String time;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructores
    public News() {}
    
    public News(String title, String summary, String image, String category, String time) {
        this.title = title;
        this.summary = summary;
        this.image = image;
        this.category = category;
        this.time = time;
    }
    
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
    
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

// ============================================
// 3. REPOSITORY
// ============================================

// NewsRepository.java
package com.tuapp.repository;

import com.tuapp.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findByCategory(String category);
    List<News> findByOrderByCreatedAtDesc();
    List<News> findByCategoryOrderByCreatedAtDesc(String category);
}

// ============================================
// 4. SERVICE
// ============================================

// NewsService.java
package com.tuapp.service;

import com.tuapp.model.News;
import com.tuapp.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class NewsService {
    
    @Autowired
    private NewsRepository newsRepository;
    
    public List<News> getAllNews() {
        return newsRepository.findByOrderByCreatedAtDesc();
    }
    
    public Optional<News> getNewsById(Long id) {
        return newsRepository.findById(id);
    }
    
    public List<News> getNewsByCategory(String category) {
        return newsRepository.findByCategoryOrderByCreatedAtDesc(category);
    }
    
    public News createNews(News news) {
        return newsRepository.save(news);
    }
    
    public News updateNews(Long id, News newsDetails) {
        News news = newsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
        
        news.setTitle(newsDetails.getTitle());
        news.setSummary(newsDetails.getSummary());
        news.setImage(newsDetails.getImage());
        news.setCategory(newsDetails.getCategory());
        news.setTime(newsDetails.getTime());
        
        return newsRepository.save(news);
    }
    
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }
    
    public List<String> getCategories() {
        return newsRepository.findAll()
            .stream()
            .map(News::getCategory)
            .distinct()
            .collect(Collectors.toList());
    }
}

// ============================================
// 5. CONTROLLER
// ============================================

// NewsController.java
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
        List<News> news = newsService.getAllNews();
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<News>> getNewsByCategory(@PathVariable String category) {
        List<News> news = newsService.getNewsByCategory(category);
        return ResponseEntity.ok(news);
    }
    
    @PostMapping
    public ResponseEntity<News> createNews(@RequestBody News news) {
        News createdNews = newsService.createNews(news);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNews);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody News news) {
        try {
            News updatedNews = newsService.updateNews(id, news);
            return ResponseEntity.ok(updatedNews);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = newsService.getCategories();
        return ResponseEntity.ok(categories);
    }
}

// ============================================
// 6. HEALTH CHECK ENDPOINT
// ============================================

// HealthController.java
package com.tuapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "Backend Spring Boot funcionando correctamente");
        return ResponseEntity.ok(response);
    }
}

// ============================================
// 7. APPLICATION.PROPERTIES
// ============================================

/*
# application.properties

# Puerto del servidor
server.port=8080

# Context path
server.servlet.context-path=/

# Base de datos H2 (para pruebas)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# H2 Console (opcional, para desarrollo)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Logging
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=INFO

# Para MySQL (comentado)
# spring.datasource.url=jdbc:mysql://localhost:3306/football_db
# spring.datasource.username=root
# spring.datasource.password=password
# spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
*/

// ============================================
// 8. SCRIPT SQL INICIAL (data.sql)
// ============================================

/*
-- data.sql
INSERT INTO news (title, summary, image, category, time, created_at, updated_at) VALUES
('Fichaje bomba: Manchester City cierra la contratación del año', 
 'El equipo inglés confirma la llegada de una de las estrellas más prometedoras del fútbol mundial.', 
 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop', 
 'Fichajes', 
 'Hace 15 minutos',
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP),

('Champions League: Definidos los cruces de semifinales', 
 'Los cuatro mejores equipos de Europa conocen a sus rivales.', 
 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop', 
 'Competiciones', 
 'Hace 1 hora',
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP),

('Lesión de última hora afecta al equipo líder', 
 'El delantero estrella estará fuera por 6 semanas.', 
 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop', 
 'Lesiones', 
 'Hace 2 horas',
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP);
*/

// ============================================
// 9. POM.XML DEPENDENCIES
// ============================================

/*
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- H2 Database (para desarrollo) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>

    <!-- Spring Security Resource Server (para validar JWT de Supabase) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>

    <!-- (Opcional) PostgreSQL driver para conectar a la BD de Supabase -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
</dependencies>

// ============================================
// 10. SPRING SECURITY - RESOURCE SERVER (EJEMPLO)
// ============================================

// SecurityConfig.java
package com.tuapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/api/test/public").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }
}

// ============================================
// 11. CONTROLADOR PROTEGIDO (EJEMPLO)
// ============================================

// ProtectedController.java
package com.tuapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class ProtectedController {

    @GetMapping("/protected")
    public ResponseEntity<String> protectedEndpoint(@AuthenticationPrincipal Jwt jwt) {
        String sub = jwt.getSubject();
        return ResponseEntity.ok("Acceso permitido. sub=" + sub);
    }

    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("Public endpoint OK");
    }
}

// ============================================
// 12. application.properties (ejemplos a añadir)
// ============================================

/*
# Para validar JWT de Supabase usa la URL JWKS
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://htdvrcajzddfjzpbfjhb.supabase.co/auth/v1/.well-known/jwks.json

# Si quieres usar la BD de Supabase (Postgres) en lugar de H2, configura algo así:
# spring.datasource.url=jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres?sslmode=require
# spring.datasource.username=postgres
# spring.datasource.password=<your_db_password>
# spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
*/
        <scope>runtime</scope>
    </dependency>
    
    <!-- MySQL Connector (si usas MySQL) -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok (opcional, para reducir código) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
*/
