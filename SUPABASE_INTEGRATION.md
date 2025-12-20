# Integración Supabase - App Móvil Ionic

## 📱 Configuración para Ionic

### Instalación del Cliente Supabase
```bash
npm install @supabase/supabase-js
```

### Variables de Entorno

#### src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://htdvrcajzddfjzpbfjhb.supabase.co',
    key: 'sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn'
  },
  api: {
    // Spring Boot Backend (local development)
    baseUrl: 'http://localhost:8080/api'
  }
};
```

#### src/environments/environment.prod.ts
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://htdvrcajzddfjzpbfjhb.supabase.co',
    key: 'sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn'
  },
  api: {
    // Spring Boot Backend (production - cuando lo despliegues)
    baseUrl: 'https://TU_BACKEND_URL.com/api'
  }
};
```

## 🔧 Servicio Supabase

### src/app/services/supabase.service.ts
```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  // Auth Methods
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return { data, error };
  }

  // Database Methods - Animes
  async getAnimes() {
    const { data, error } = await this.supabase
      .from('animes')
      .select('*')
      .order('title_romaji', { ascending: true });
    return { data, error };
  }

  async getAnimeById(id: number) {
    const { data, error } = await this.supabase
      .from('animes')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Database Methods - User Anime Lists
  async getUserAnimeList(userId: number) {
    const { data, error } = await this.supabase
      .from('user_anime_lists')
      .select(`
        *,
        anime:animes(*)
      `)
      .eq('user_id', userId);
    return { data, error };
  }

  async addToList(userId: number, animeId: number, watchStatus: string) {
    const { data, error } = await this.supabase
      .from('user_anime_lists')
      .insert({
        user_id: userId,
        anime_id: animeId,
        watch_status: watchStatus,
        added_date: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  }

  async updateListItem(id: number, updates: any) {
    const { data, error } = await this.supabase
      .from('user_anime_lists')
      .update({
        ...updates,
        updated_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Realtime Subscriptions
  subscribeToAnimes(callback: (payload: any) => void) {
    return this.supabase
      .channel('animes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'animes' },
        callback
      )
      .subscribe();
  }
}
```

## 🎯 Uso en Componentes

### Ejemplo: Lista de Animes
```typescript
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-anime-list',
  templateUrl: './anime-list.page.html',
  styleUrls: ['./anime-list.page.scss'],
})
export class AnimeListPage implements OnInit {
  animes: any[] = [];
  loading = false;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadAnimes();
  }

  async loadAnimes() {
    this.loading = true;
    const { data, error } = await this.supabase.getAnimes();
    
    if (error) {
      console.error('Error loading animes:', error);
    } else {
      this.animes = data || [];
    }
    
    this.loading = false;
  }
}
```

### Ejemplo: Autenticación
```typescript
import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async login() {
    const { data, error } = await this.supabase.signIn(
      this.email,
      this.password
    );

    if (error) {
      console.error('Login error:', error.message);
      // Mostrar toast de error
    } else {
      console.log('Login successful:', data);
      this.router.navigate(['/home']);
    }
  }
}
```

## 🔄 Opciones de Arquitectura

### Opción 1: Solo Supabase (Directo)
- App móvil → Supabase directamente
- Usa Row Level Security (RLS) en Supabase para seguridad
- Más simple, menos mantenimiento

### Opción 2: Híbrido (Recomendado)
- App móvil → Spring Boot → Supabase
- Lógica de negocio en Spring Boot
- Supabase solo como base de datos

### Opción 3: Mixto
- Auth & realtime → Supabase directo
- CRUD & lógica compleja → Spring Boot

## 🔒 Seguridad

### Row Level Security (RLS)
Si usas Supabase directo, habilita RLS:

```sql
-- Habilitar RLS en users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo pueden ver su propia info
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: usuarios pueden actualizar su propia info
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);
```

## 📝 Notas Importantes

1. **API Key Pública:** La clave `sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn` es segura para frontend
2. **Service Role Key:** NUNCA uses el service_role key en el frontend
3. **RLS:** Implementa Row Level Security si usas Supabase directo
4. **CORS:** Asegúrate que Spring Boot permita CORS desde Ionic en desarrollo

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve

# Ejecutar en Android
ionic capacitor run android

# Ejecutar en iOS
ionic capacitor run ios

# Build para producción
ionic build --prod
```

## 🔗 Referencias
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Ionic + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-ionic-angular)
