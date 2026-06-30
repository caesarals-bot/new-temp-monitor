-- ============================================================================
-- TempMonitor V1 — Cleanup Script
-- ============================================================================
-- EJECUTAR PRIMERO: Limpia TODA la base de datos existente
-- No produce errores si algo no existe (usa DROP IF EXISTS)
-- ============================================================================

DO $$ DECLARE
    r RECORD;
BEGIN
    -- 1. Borrar triggers primero
    FOR r IN SELECT trigger_name, event_object_table
             FROM information_schema.triggers
             WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE',
                       r.trigger_name, r.event_object_table);
    END LOOP;

    -- 2. Borrar funciones y procedimientos
    FOR r IN SELECT routine_name, routine_schema
             FROM information_schema.routines
             WHERE routine_schema = 'public'
               AND routine_type = 'FUNCTION'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I() CASCADE', r.routine_name);
    END LOOP;
END $$;

-- 3. Borrar tablas (en orden inverso por dependencias)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS temperature_readings CASCADE;
DROP TABLE IF EXISTS restaurant_assigments CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS location_assignments CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 3b. Verificar y borrar cualquier tabla restante con "restaurant" en el nombre
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        IF r.tablename LIKE '%restaurant%' THEN
            EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
            RAISE NOTICE 'Dropped table: %', r.tablename;
        END IF;
    END LOOP;
END $$;

-- 4. Borrar tipos enum (en orden por dependencias)
DROP TYPE IF EXISTS reading_type_enum CASCADE;
DROP TYPE IF EXISTS incident_status_enum CASCADE;
DROP TYPE IF EXISTS organization_status CASCADE;
DROP TYPE IF EXISTS organization_status_enum CASCADE;
DROP TYPE IF EXISTS location_role_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS plan_type_enum CASCADE;
DROP TYPE IF EXISTS business_type_enum CASCADE;
DROP TYPE IF EXISTS equipment_location_role_enum CASCADE;

-- 5. Verificar que quedó limpio
SELECT 'Tablas restantes: ' || COUNT(*) AS result
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT 'Tipos restantes: ' || COUNT(*) AS result
FROM pg_type
WHERE typnamespace = 'public'::regnamespace;

-- Mostrar tablas exactas que quedaron
SELECT 'Tablas: ' || string_agg(table_name, ', ') AS result
FROM information_schema.tables
WHERE table_schema = 'public';
