-- Migration: 003_custom_auth.sql
-- Custom phone + password authentication

-- Add password_hash column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create function to hash password using pgcrypto
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(plain_password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify password
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hashed_password = crypt(plain_password, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to login with phone and password
CREATE OR REPLACE FUNCTION login_with_phone(p_phone TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  -- Find profile by phone
  SELECT * INTO profile_record
  FROM profiles
  WHERE phone = p_phone
  LIMIT 1;

  -- Check if profile exists
  IF profile_record.id IS NULL THEN
    RAISE EXCEPTION 'Nomor HP tidak terdaftar';
  END IF;

  -- Check if account is active
  IF NOT profile_record.is_active THEN
    RAISE EXCEPTION 'Akun tidak aktif. Hubungi admin.';
  END IF;

  -- Check if password is set
  IF profile_record.password_hash IS NULL THEN
    RAISE EXCEPTION 'Password belum diatur';
  END IF;

  -- Verify password
  IF NOT verify_password(p_password, profile_record.password_hash) THEN
    RAISE EXCEPTION 'Password salah';
  END IF;

  -- Return profile
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register new user with phone
CREATE OR REPLACE FUNCTION register_with_phone(
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN
) AS $$
DECLARE
  existing_profile profiles%ROWTYPE;
  new_profile profiles%ROWTYPE;
BEGIN
  -- Check if phone already exists
  SELECT * INTO existing_profile FROM profiles WHERE phone = p_phone LIMIT 1;
  
  IF existing_profile.id IS NOT NULL THEN
    RAISE EXCEPTION 'Nomor HP sudah terdaftar';
  END IF;

  -- Check if email already exists (if provided)
  IF p_email IS NOT NULL THEN
    SELECT * INTO existing_profile FROM profiles WHERE email = p_email LIMIT 1;
    IF existing_profile.id IS NOT NULL THEN
      RAISE EXCEPTION 'Email sudah terdaftar';
    END IF;
  END IF;

  -- Insert new profile with hashed password
  INSERT INTO profiles (full_name, phone, email, password_hash, role, is_active)
  VALUES (p_full_name, p_phone, p_email, hash_password(p_password), 'member', true)
  RETURNING * INTO new_profile;

  RETURN QUERY SELECT id, full_name, phone, email, role, is_active FROM profiles WHERE id = new_profile.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update password
CREATE OR REPLACE FUNCTION update_profile_password(profile_id UUID, new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET password_hash = hash_password(new_password)
  WHERE id = profile_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset password (admin only)
CREATE OR REPLACE FUNCTION admin_reset_password(profile_id UUID, new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET password_hash = hash_password(new_password)
  WHERE id = profile_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current profile by phone (for session management)
CREATE OR REPLACE FUNCTION get_profile_by_phone(p_phone TEXT)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY 
  SELECT id, auth_user_id, full_name, phone, email, role, is_active
  FROM profiles
  WHERE phone = p_phone AND is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;