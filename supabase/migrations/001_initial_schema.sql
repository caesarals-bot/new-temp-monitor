-- ============================================================================
-- TempMonitor V1 — Schema Completo
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- 1. BORRAR TABLAS EXISTENTES (en orden inverso por dependencias)
-- ============================================================================
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS temperature_readings CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS location_assignments CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Eliminar tipos si existen
DROP TYPE IF EXISTS business_type_enum CASCADE;
DROP TYPE IF EXISTS plan_type_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS location_role_enum CASCADE;
DROP TYPE IF EXISTS equipment_location_role_enum CASCADE;
DROP TYPE IF EXISTS organization_status_enum CASCADE;
DROP TYPE IF EXISTS incident_status_enum CASCADE;
DROP TYPE IF EXISTS reading_type_enum CASCADE;

-- Eliminar funciones y triggers
DROP FUNCTION IF EXISTS check_location_limit() CASCADE;

-- ============================================================================
-- 2. CREAR TIPOS ENUM
-- ============================================================================

CREATE TYPE business_type_enum AS ENUM ('restaurant', 'pharmacy', 'butcher_shop', 'supermarket', 'general');
CREATE TYPE plan_type_enum AS ENUM ('basic', 'pro', 'enterprise');
CREATE TYPE organization_status_enum AS ENUM ('active', 'paused', 'suspended');
CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'manager', 'staff');
CREATE TYPE location_role_enum AS ENUM ('manager', 'staff');
CREATE TYPE organization_status AS ENUM ('active', 'paused', 'suspended');
CREATE TYPE incident_status_enum AS ENUM ('open', 'resolved');
CREATE TYPE reading_type_enum AS ENUM ('manual', 'iot');

-- ============================================================================
-- 3. CREAR TABLAS
-- ============================================================================

-- organizations (Empresas / Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_type business_type_enum,
    status organization_status_enum DEFAULT 'active',
    plan_type plan_type_enum DEFAULT 'basic',
    max_locations INTEGER DEFAULT 1,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles (Perfiles de Usuario - vinculado a auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role user_role_enum DEFAULT 'staff',
    is_platform_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- locations (Sedes / Sucursales)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- location_assignments (Asignaciones de Personal a Sedes)
CREATE TABLE location_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    role location_role_enum DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, location_id)
);

-- equipment (Equipos de Frío)
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    physical_location TEXT,
    code TEXT UNIQUE,
    min_temp DECIMAL NOT NULL,
    max_temp DECIMAL NOT NULL,
    is_iot_enabled BOOLEAN DEFAULT FALSE,
    iot_device_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff (Colaboradores Operativos - sin login)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- temperature_readings (Historial de Mediciones)
CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    value DECIMAL NOT NULL,
    reading_type reading_type_enum DEFAULT 'manual',
    sensor_battery DECIMAL,
    sensor_signal DECIMAL,
    snapshot_min_temp DECIMAL,
    snapshot_max_temp DECIMAL,
    recorded_by_profile UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recorded_by_staff UUID REFERENCES staff(id) ON DELETE SET NULL,
    taken_by TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- incidents (Incidentes y Alertas)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID NOT NULL REFERENCES temperature_readings(id) ON DELETE CASCADE,
    status incident_status_enum DEFAULT 'open',
    description TEXT NOT NULL,
    action_taken TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. CREAR ÍNDICES
-- ============================================================================

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_location_assignments_user ON location_assignments(user_id);
CREATE INDEX idx_location_assignments_location ON location_assignments(location_id);
CREATE INDEX idx_equipment_location ON equipment(location_id);
CREATE INDEX idx_staff_location ON staff(location_id);
CREATE INDEX idx_temperature_readings_equipment ON temperature_readings(equipment_id);
CREATE INDEX idx_temperature_readings_recorded_at ON temperature_readings(recorded_at DESC);
CREATE INDEX idx_incidents_reading ON incidents(reading_id);
CREATE INDEX idx_incidents_status ON incidents(status);

-- ============================================================================
-- 5. CREAR FUNCIÓN check_location_limit (Trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_location_limit()
RETURNS TRIGGER AS $$
DECLARE
    org_plan plan_type_enum;
    org_max_locations INTEGER;
    current_location_count INTEGER;
BEGIN
    -- Obtener el plan y límite de la organización
    SELECT plan_type, max_locations INTO org_plan, org_max_locations
    FROM organizations
    WHERE id = (SELECT organization_id FROM locations WHERE id = NEW.location_id);

    -- Contar ubicaciones actuales
    SELECT COUNT(*) INTO current_location_count
    FROM locations
    WHERE organization_id = (SELECT organization_id FROM locations WHERE id = NEW.location_id);

    -- Verificar si excede el límite
    IF current_location_count >= org_max_locations THEN
        RAISE EXCEPTION 'Has alcanzado el límite de % sede(s) para tu plan %', org_max_locations, org_plan;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREAR TRIGGER PARA check_location_limit
-- ============================================================================

CREATE TRIGGER trg_check_location_limit
    BEFORE INSERT ON locations
    FOR EACH ROW
    EXECUTE FUNCTION check_location_limit();

-- ============================================================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. POLÍTICAS RLS
-- ============================================================================

-- organizations: usuarios ven solo su organización
CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = organizations.id
    ));

CREATE POLICY "Users can update own organization"
    ON organizations FOR UPDATE
    USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = organizations.id AND role IN ('owner', 'admin')
    ));

-- profiles: usuarios ven solo perfiles de su organización
CREATE POLICY "Users can view profiles in own organization"
    ON profiles FOR SELECT
    USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- locations: usuarios ven sedes de su organización
CREATE POLICY "Users can view locations in own organization"
    ON locations FOR SELECT
    USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage locations"
    ON locations FOR ALL
    USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- location_assignments: usuarios ven asignaciones de su organización
CREATE POLICY "Users can view location assignments in own organization"
    ON location_assignments FOR SELECT
    USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

-- equipment: usuarios ven equipos de su organización
CREATE POLICY "Users can view equipment in own organization"
    ON equipment FOR SELECT
    USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Admins can manage equipment"
    ON equipment FOR ALL
    USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'manager')
    ));

-- staff: usuarios ven staff de su organización
CREATE POLICY "Users can view staff in own organization"
    ON staff FOR SELECT
    USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Admins can manage staff"
    ON staff FOR ALL
    USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'manager')
    ));

-- temperature_readings: usuarios ven lecturas de su organización
CREATE POLICY "Users can view readings in own organization"
    ON temperature_readings FOR SELECT
    USING (equipment_id IN (
        SELECT e.id FROM equipment e
        JOIN locations l ON l.id = e.location_id
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Users can insert readings"
    ON temperature_readings FOR INSERT
    WITH CHECK (equipment_id IN (
        SELECT e.id FROM equipment e
        JOIN locations l ON l.id = e.location_id
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

-- incidents: usuarios ven incidentes de su organización
CREATE POLICY "Users can view incidents in own organization"
    ON incidents FOR SELECT
    USING (reading_id IN (
        SELECT tr.id FROM temperature_readings tr
        JOIN equipment e ON e.id = tr.equipment_id
        JOIN locations l ON l.id = e.location_id
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid()
    ));

CREATE POLICY "Managers can resolve incidents"
    ON incidents FOR UPDATE
    USING (reading_id IN (
        SELECT tr.id FROM temperature_readings tr
        JOIN equipment e ON e.id = tr.equipment_id
        JOIN locations l ON l.id = e.location_id
        JOIN profiles p ON p.organization_id = l.organization_id
        WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'manager')
    ));

-- ============================================================================
-- 9. CREAR FUNCIONES ÚTILES
-- ============================================================================

-- Función para crear organization + profile owner en una transacción
CREATE OR REPLACE FUNCTION create_organization_with_owner(
    p_org_name TEXT,
    p_business_type business_type_enum,
    p_plan_type plan_type_enum,
    p_owner_email TEXT,
    p_owner_full_name TEXT,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Crear organización
    INSERT INTO organizations (name, business_type, plan_type, created_by)
    VALUES (p_org_name, p_business_type, p_plan_type, p_user_id)
    RETURNING id INTO v_org_id;

    -- Crear perfil owner
    INSERT INTO profiles (id, email, full_name, organization_id, role)
    VALUES (p_user_id, p_owner_email, p_owner_full_name, v_org_id, 'owner');

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. VERIFICACIÓN
-- ============================================================================

-- Verificar que todas las tablas existen
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
