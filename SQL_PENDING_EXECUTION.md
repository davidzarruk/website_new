# SQL Pendiente de Ejecución en Supabase

## Problema 1: Emails no aparecen en Analytics Dashboard
**Motivo:** La columna `email` no existe en `user_profiles`

**Solución:** Ejecutar este SQL en Supabase Dashboard → SQL Editor:

```sql
-- Add email column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Populate emails from auth.users for existing users
UPDATE user_profiles
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = user_profiles.id
)
WHERE email IS NULL;
```

---

## Problema 2: Photo count muestra 0 (debería mostrar 12)
**Motivo:** RLS (Row Level Security) en `user_photos` no permite acceso público

**Solución:** Ejecutar este SQL en Supabase Dashboard → SQL Editor:

```sql
-- Allow public read access to user_photos (for analytics dashboard)
-- Option 1: Only public profiles visible
CREATE POLICY "Public can view public user photos" 
ON user_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = user_photos.user_id 
    AND user_profiles.is_public = true
  )
  OR user_photos.user_id = auth.uid()
);

-- Option 2 (SIMPLER): Allow anon to count all photos
-- Uncomment if you prefer this approach:
-- DROP POLICY IF EXISTS "Public can view public user photos" ON user_photos;
-- CREATE POLICY "Anon can read all photos for analytics" 
-- ON user_photos 
-- FOR SELECT 
-- TO anon
-- USING (true);
```

---

## Verificación

Después de ejecutar ambos SQL queries:

1. **Emails aparecerán** en las tarjetas de usuario
2. **Photo count correcto** (12 fotos para David)

Espera ~1-2 minutos después de ejecutar para que los cambios se reflejen en www.davidzarruk.com (auto-deploy de GitHub Actions).

---

## Archivo de referencia
- `/root/.openclaw/workspace/datarunner/ADD_EMAIL_TO_PROFILES.sql`
- `/root/.openclaw/workspace/datarunner/FIX_USER_PHOTOS_RLS.sql`
