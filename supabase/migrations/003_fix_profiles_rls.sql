-- ============================================================================
-- TempMonitor V1 — Simplificación de RLS para evitar recursión y optimizar consultas
-- ============================================================================
-- Migración: 003_fix_profiles_rls.sql
-- ============================================================================

-- 1. Helper functions con SECURITY DEFINER (omiten RLS internamente)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role_enum
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

-- 2. profiles
DROP POLICY IF EXISTS "Users can view profiles in own organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in own organization"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_user_organization_id());

-- 3. locations
DROP POLICY IF EXISTS "Users can view locations in own organization" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;

CREATE POLICY "Users can view locations in own organization"
    ON public.locations FOR SELECT
    USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage locations"
    ON public.locations FOR ALL
    USING (organization_id = public.get_user_organization_id() AND public.get_user_role() IN ('owner', 'admin'));

-- 4. equipment
DROP POLICY IF EXISTS "Users can view equipment in own organization" ON public.equipment;
DROP POLICY IF EXISTS "Admins can manage equipment" ON public.equipment;

CREATE POLICY "Users can view equipment in own organization"
    ON public.equipment FOR SELECT
    USING (location_id IN (SELECT id FROM public.locations WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Admins can manage equipment"
    ON public.equipment FOR ALL
    USING (
        location_id IN (SELECT id FROM public.locations WHERE organization_id = public.get_user_organization_id())
        AND public.get_user_role() IN ('owner', 'admin', 'manager')
    );

-- 5. staff
DROP POLICY IF EXISTS "Users can view staff in own organization" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;

CREATE POLICY "Users can view staff in own organization"
    ON public.staff FOR SELECT
    USING (location_id IN (SELECT id FROM public.locations WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Admins can manage staff"
    ON public.staff FOR ALL
    USING (
        location_id IN (SELECT id FROM public.locations WHERE organization_id = public.get_user_organization_id())
        AND public.get_user_role() IN ('owner', 'admin', 'manager')
    );

-- 6. temperature_readings
DROP POLICY IF EXISTS "Users can view readings in own organization" ON public.temperature_readings;
DROP POLICY IF EXISTS "Users can insert readings" ON public.temperature_readings;

CREATE POLICY "Users can view readings in own organization"
    ON public.temperature_readings FOR SELECT
    USING (
        equipment_id IN (
            SELECT e.id FROM public.equipment e
            JOIN public.locations l ON l.id = e.location_id
            WHERE l.organization_id = public.get_user_organization_id()
        )
    );

CREATE POLICY "Users can insert readings"
    ON public.temperature_readings FOR INSERT
    WITH CHECK (
        equipment_id IN (
            SELECT e.id FROM public.equipment e
            JOIN public.locations l ON l.id = e.location_id
            WHERE l.organization_id = public.get_user_organization_id()
        )
    );

-- 7. incidents
DROP POLICY IF EXISTS "Users can view incidents in own organization" ON public.incidents;
DROP POLICY IF EXISTS "Managers can resolve incidents" ON public.incidents;

CREATE POLICY "Users can view incidents in own organization"
    ON public.incidents FOR SELECT
    USING (
        reading_id IN (
            SELECT tr.id FROM public.temperature_readings tr
            JOIN public.equipment e ON e.id = tr.equipment_id
            JOIN public.locations l ON l.id = e.location_id
            WHERE l.organization_id = public.get_user_organization_id()
        )
    );

CREATE POLICY "Managers can resolve incidents"
    ON public.incidents FOR UPDATE
    USING (
        reading_id IN (
            SELECT tr.id FROM public.temperature_readings tr
            JOIN public.equipment e ON e.id = tr.equipment_id
            JOIN public.locations l ON l.id = e.location_id
            WHERE l.organization_id = public.get_user_organization_id()
        )
        AND public.get_user_role() IN ('owner', 'admin', 'manager')
    );
