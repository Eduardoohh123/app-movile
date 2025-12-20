import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio para interactuar con Supabase
 * Maneja autenticación y operaciones de base de datos
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject: BehaviorSubject<SupabaseUser | null>;
  public currentUser$: Observable<SupabaseUser | null>;

  constructor() {
    // Inicializar cliente de Supabase
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );

    this.currentUserSubject = new BehaviorSubject<SupabaseUser | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Verificar sesión actual
    this.initializeSession();
  }

  private async initializeSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUserSubject.next(session.user);
    }

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event);
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Registrar nuevo usuario
   */
  async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      console.log('✅ Usuario registrado:', data.user?.email);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al registrar usuario:', error);
      return { data: null, error };
    }
  }

  /**
   * Iniciar sesión
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      console.log('✅ Sesión iniciada:', data.user?.email);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      return { data: null, error };
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Sesión cerrada');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error.message);
      return { error };
    }
  }

  /**
   * Obtener sesión actual
   */
  async getSession() {
    return await this.supabase.auth.getSession();
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): SupabaseUser | null {
    return this.currentUserSubject.value;
  }

  // ==================== USUARIOS (TABLA) ====================

  /**
   * Crear perfil de usuario en la tabla 'users'
   */
  async createUserProfile(userData: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    phone?: string;
    balance?: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([{
          id: userData.id,
          email: userData.email,
          name: userData.name || 'Usuario',
          avatar: userData.avatar,
          phone: userData.phone,
          balance: userData.balance || 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Perfil de usuario creado en Supabase');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al crear perfil:', error.message);
      return { data: null, error };
    }
  }

  /**
   * Obtener perfil de usuario por ID
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al obtener perfil:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(userId: string, updates: {
    name?: string;
    avatar?: string;
    phone?: string;
    balance?: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Perfil actualizado en Supabase');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error.message);
      return { data: null, error };
    }
  }

  /**
   * Obtener todos los usuarios (gestión de usuarios)
   */
  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data?.length || 0} usuarios obtenidos de Supabase`);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al obtener usuarios:', error.message);
      return { data: null, error };
    }
  }

  /**
   * Eliminar usuario
   */
  async testConnectivity() {
    try {
      const res = await fetch(environment.supabase.url, { method: 'GET' });
      console.log('🔎 Supabase connectivity:', { ok: res.ok, status: res.status, text: await res.text() });
      return { ok: res.ok, status: res.status, text: await res.text() };
    } catch (error: any) {
      console.error('❌ Supabase connectivity test failed:', error);
      return { ok: false, error };
    }
  }

  // Prueba de /auth/v1 sin cabeceras
  async testAuthWithoutHeaders() {
    try {
      const url = `${environment.supabase.url}/auth/v1`;
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      console.log('🔎 /auth/v1 without headers:', { ok: res.ok, status: res.status, text });
      return { ok: res.ok, status: res.status, text };
    } catch (error: any) {
      console.error('❌ /auth/v1 without headers failed:', error);
      return { ok: false, error };
    }
  }

  // Prueba de /auth/v1 con cabeceras apikey/Authorization
  async testAuthWithHeaders() {
    try {
      const url = `${environment.supabase.url}/auth/v1`;
      const res = await fetch(url, { method: 'GET', headers: {
        'apikey': environment.supabase.key,
        'Authorization': `Bearer ${environment.supabase.key}`
      }});
      const text = await res.text();
      console.log('🔎 /auth/v1 with headers:', { ok: res.ok, status: res.status, text });
      return { ok: res.ok, status: res.status, text };
    } catch (error: any) {
      console.error('❌ /auth/v1 with headers failed:', error);
      return { ok: false, error };
    }
  }

  // Prueba a REST (/rest/v1) con y sin cabeceras
  async testRestWithHeaders() {
    try {
      const url = `${environment.supabase.url}/rest/v1`;
      const res = await fetch(url, { method: 'GET', headers: {
        'apikey': environment.supabase.key,
        'Authorization': `Bearer ${environment.supabase.key}`
      }});
      const text = await res.text();
      console.log('🔎 /rest/v1 with headers:', { ok: res.ok, status: res.status, text });
      return { ok: res.ok, status: res.status, text };
    } catch (error: any) {
      console.error('❌ /rest/v1 with headers failed:', error);
      return { ok: false, error };
    }
  }
  async deleteUser(userId: string) {
    try {
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      console.log('✅ Usuario eliminado de Supabase');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error.message);
      return { error };
    }
  }

  // ==================== OTROS DATOS ====================

  /**
   * Ejecutar query personalizado
   */
  async query(table: string, options?: {
    select?: string;
    filter?: { column: string; value: any };
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }) {
    try {
      let query = this.supabase.from(table).select(options?.select || '*');

      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }

      if (options?.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? true 
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error en query:', error.message);
      return { data: null, error };
    }
  }

  /**
   * Insertar datos en cualquier tabla
   */
  async insert(table: string, data: any) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      console.log(`✅ Datos insertados en tabla ${table}`);
      return { data: result, error: null };
    } catch (error: any) {
      console.error(`❌ Error al insertar en ${table}:`, error.message);
      return { data: null, error };
    }
  }

  /**
   * Actualizar datos en cualquier tabla
   */
  async update(table: string, id: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log(`✅ Datos actualizados en tabla ${table}`);
      return { data, error: null };
    } catch (error: any) {
      console.error(`❌ Error al actualizar ${table}:`, error.message);
      return { data: null, error };
    }
  }

  /**
   * Eliminar datos de cualquier tabla
   */
  async delete(table: string, id: string) {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log(`✅ Datos eliminados de tabla ${table}`);
      return { error: null };
    } catch (error: any) {
      console.error(`❌ Error al eliminar de ${table}:`, error.message);
      return { error };
    }
  }

  // ==================== STORAGE ====================

  /**
   * Subir archivo a Supabase Storage
   */
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      console.log('✅ Archivo subido:', path);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error al subir archivo:', error.message);
      return { data: null, error };
    }
  }

  /**
   * Obtener URL pública de un archivo
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
}
