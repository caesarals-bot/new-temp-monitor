-- ============================================================================
-- TempMonitor V1 — Políticas RLS y Vistas para Platform Admin
-- ============================================================================
-- Migración: 002_platform_admin_policies.sql
-- ============================================================================

-- 1. Helper function para validar rol is_platform_admin
-- Definida como SECURITY DEFINER para que pueda consultar la tabla profiles
-- independientemente de las políticas RLS restrictivas de esa tabla.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_platform_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Políticas RLS para Platform Admin (acceso global a metadatos)

-- organizations: SELECT e UPDATE
CREATE POLICY "Platform admins can select all organizations"
    ON public.organizations FOR SELECT
    USING (public.is_platform_admin());

CREATE POLICY "Platform admins can update all organizations"
    ON public.organizations FOR UPDATE
    USING (public.is_platform_admin());

-- locations: SELECT
CREATE POLICY "Platform admins can select all locations"
    ON public.locations FOR SELECT
    USING (public.is_platform_admin());

-- profiles: SELECT
CREATE POLICY "Platform admins can select all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_platform_admin());

-- equipment: SELECT
CREATE POLICY "Platform admins can select all equipment"
    ON public.equipment FOR SELECT
    USING (public.is_platform_admin());

-- 3. Vistas de Resumen con Enmascaramiento de Datos (Tenant Isolation Interno)
-- Al no tener RLS habilitado directamente en la vista (por defecto en Postgres),
-- se ejecutan con los privilegios del creador (bypass RLS de tablas base),
-- pero el WHERE filtra estrictamente según el rol y organización del usuario.

-- Vista de lecturas de temperatura sin el valor térmico (excluye columna value)
CREATE OR REPLACE VIEW public.temperature_readings_summary AS
SELECT 
  tr.id,
  tr.equipment_id,
  tr.reading_type,
  tr.sensor_battery,
  tr.sensor_signal,
  tr.snapshot_min_temp,
  tr.snapshot_max_temp,
  tr.recorded_by_profile,
  tr.recorded_by_staff,
  tr.taken_by,
  tr.recorded_at,
  l.organization_id
FROM public.temperature_readings tr
JOIN public.equipment e ON e.id = tr.equipment_id
JOIN public.locations l ON l.id = e.location_id
WHERE 
  public.is_platform_admin()
  OR 
  l.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid());

-- Vista de incidentes sin descripción ni acción correctiva (excluye description/action_taken)
CREATE OR REPLACE VIEW public.incidents_summary AS
SELECT 
  i.id,
  i.reading_id,
  i.status,
  i.resolved_by,
  i.resolved_at,
  i.created_at,
  l.organization_id
FROM public.incidents i
JOIN public.temperature_readings tr ON tr.id = i.reading_id
JOIN public.equipment e ON e.id = tr.equipment_id
JOIN public.locations l ON l.id = e.location_id
WHERE 
  public.is_platform_admin()
  OR 
  l.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
