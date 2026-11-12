/*
# Create profiles and clients tables for Gestion Immobilier

1. New Tables
- `profiles` — extends Supabase auth.users with extra user info (nom, prenom, contact, role, statut).
  - id (uuid, PK, references auth.users)
  - nom (text, user last name)
  - prenom (text, user first name)
  - contact (text, phone number)
  - role (text, default 'user' — can be 'user' or 'admin')
  - statut (text, default 'actif' — can be 'actif' or 'inactif')
  - created_at (timestamptz)
- `clients` — real estate clients linked to apartments.
  - id (uuid, PK)
  - nom (text)
  - prenom (text)
  - contact (text)
  - numapp (integer, apartment number)
  - user_id (uuid, references auth.users, the agent who added the client)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- profiles: users can read/update their own profile; admins can read all profiles.
  INSERT is handled by a trigger on auth.users (signup), not by client inserts.
  Admins can UPDATE profiles (to toggle statut or edit user info).
- clients: authenticated users can CRUD their own clients; admins can see all.
- service_role gets full access for edge functions if needed.

3. Important Notes
- A trigger automatically creates a profile row when a new auth.users row is inserted (on signup).
- The first registered user is NOT automatically admin. Admin status is set manually
  in the Supabase dashboard or via SQL: UPDATE profiles SET role='admin' WHERE email='...'.
- The admin dashboard reads all profiles using a SECURITY DEFINER function to bypass RLS.
*/

-- ===== PROFILES TABLE =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text DEFAULT '',
  prenom text DEFAULT '',
  contact text DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  statut text NOT NULL DEFAULT 'actif',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Users can update their own profile (but not role/statut via this policy)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admins can update any profile (toggle statut, edit info)
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admins can delete profiles
DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;
CREATE POLICY "admin_delete_profiles" ON profiles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

GRANT SELECT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

-- ===== CLIENTS TABLE =====
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  contact text NOT NULL,
  numapp integer,
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own clients
DROP POLICY IF EXISTS "select_own_clients" ON clients;
CREATE POLICY "select_own_clients" ON clients FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_clients" ON clients;
CREATE POLICY "insert_own_clients" ON clients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_clients" ON clients;
CREATE POLICY "update_own_clients" ON clients FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_clients" ON clients;
CREATE POLICY "delete_own_clients" ON clients FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admins can see all clients
DROP POLICY IF EXISTS "admin_select_all_clients" ON clients;
CREATE POLICY "admin_select_all_clients" ON clients FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO service_role;

-- ===== TRIGGER: auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, contact)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nom', ''),
    COALESCE(new.raw_user_meta_data->>'prenom', ''),
    COALESCE(new.raw_user_meta_data->>'contact', '')
  );
  RETURN new;
END;
$$;

-- Revoke execute from anon, grant to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== FUNCTION: check if current user is admin =====
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
