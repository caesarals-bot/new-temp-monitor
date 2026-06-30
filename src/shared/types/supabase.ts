/**
 * Tipos generados desde el schema de Supabase.
 *
 * IMPORTANTE: Este archivo NO se edita manualmente.
 *
 * Para regenerar después de cambiar el schema:
 * 1. Asegúrate de estar logueado en Supabase CLI (`npx supabase login`)
 * 2. Vincula el proyecto: `npx supabase link --project-ref <ref>`
 * 3. Regenera: `npx supabase gen types typescript`
 * 4. Reemplaza este archivo con el output
 *
 * Schema de referencia: `supabase/migrations/001_initial_schema.sql`
 */

// ============================================================================
// Enums
// ============================================================================

export type BusinessTypeEnum = 'restaurant' | 'pharmacy' | 'butcher_shop' | 'supermarket' | 'general';
export type PlanTypeEnum = 'basic' | 'pro' | 'enterprise';
export type OrganizationStatusEnum = 'active' | 'paused' | 'suspended';
export type UserRoleEnum = 'owner' | 'admin' | 'manager' | 'staff';
export type LocationRoleEnum = 'manager' | 'staff';
export type IncidentStatusEnum = 'open' | 'resolved';
export type ReadingTypeEnum = 'manual' | 'iot';

// ============================================================================
// Tables
// ============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          business_type: BusinessTypeEnum | null;
          status: OrganizationStatusEnum;
          plan_type: PlanTypeEnum;
          max_locations: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_type?: BusinessTypeEnum | null;
          status?: OrganizationStatusEnum;
          plan_type?: PlanTypeEnum;
          max_locations?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_type?: BusinessTypeEnum | null;
          status?: OrganizationStatusEnum;
          plan_type?: PlanTypeEnum;
          max_locations?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          organization_id: string | null;
          role: UserRoleEnum;
          is_platform_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          organization_id?: string | null;
          role?: UserRoleEnum;
          is_platform_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          organization_id?: string | null;
          role?: UserRoleEnum;
          is_platform_admin?: boolean;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          address?: string | null;
          created_at?: string;
        };
      };
      location_assignments: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          role: LocationRoleEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          role?: LocationRoleEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string;
          role?: LocationRoleEnum;
          created_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          physical_location: string | null;
          code: string | null;
          min_temp: number;
          max_temp: number;
          is_iot_enabled: boolean;
          iot_device_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          physical_location?: string | null;
          code?: string | null;
          min_temp: number;
          max_temp: number;
          is_iot_enabled?: boolean;
          iot_device_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          physical_location?: string | null;
          code?: string | null;
          min_temp?: number;
          max_temp?: number;
          is_iot_enabled?: boolean;
          iot_device_id?: string | null;
          created_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          role: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      temperature_readings: {
        Row: {
          id: string;
          equipment_id: string;
          value: number;
          reading_type: ReadingTypeEnum;
          sensor_battery: number | null;
          sensor_signal: number | null;
          snapshot_min_temp: number | null;
          snapshot_max_temp: number | null;
          recorded_by_profile: string | null;
          recorded_by_staff: string | null;
          taken_by: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          value: number;
          reading_type?: ReadingTypeEnum;
          sensor_battery?: number | null;
          sensor_signal?: number | null;
          snapshot_min_temp?: number | null;
          snapshot_max_temp?: number | null;
          recorded_by_profile?: string | null;
          recorded_by_staff?: string | null;
          taken_by?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          value?: number;
          reading_type?: ReadingTypeEnum;
          sensor_battery?: number | null;
          sensor_signal?: number | null;
          snapshot_min_temp?: number | null;
          snapshot_max_temp?: number | null;
          recorded_by_profile?: string | null;
          recorded_by_staff?: string | null;
          taken_by?: string | null;
          recorded_at?: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          reading_id: string;
          status: IncidentStatusEnum;
          description: string;
          action_taken: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reading_id: string;
          status?: IncidentStatusEnum;
          description: string;
          action_taken?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reading_id?: string;
          status?: IncidentStatusEnum;
          description?: string;
          action_taken?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================================================
// Convenience Types
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Organization = Tables<'organizations'>;
export type Profile = Tables<'profiles'>;
export type Location = Tables<'locations'>;
export type LocationAssignment = Tables<'location_assignments'>;
export type Equipment = Tables<'equipment'>;
export type Staff = Tables<'staff'>;
export type TemperatureReading = Tables<'temperature_readings'>;
export type Incident = Tables<'incidents'>;
