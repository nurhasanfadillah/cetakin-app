-- Drop existing functions
DROP FUNCTION IF EXISTS login_with_phone(TEXT, TEXT);
DROP FUNCTION IF EXISTS register_with_phone(TEXT, TEXT, TEXT);

-- Login function
CREATE OR REPLACE FUNCTION login_with_phone(p_phone TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID, auth_user_id UUID, full_name TEXT, phone TEXT, email TEXT,
  role TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY 
  SELECT pr.id, pr.auth_user_id, pr.full_name, pr.phone, pr.email,
         pr.role, pr.is_active, pr.created_at, pr.updated_at
  FROM profiles pr
  WHERE pr.phone = p_phone
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nomor HP tidak terdaftar';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register function
CREATE OR REPLACE FUNCTION register_with_phone(p_full_name TEXT, p_phone TEXT, p_password TEXT, p_email TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, phone TEXT, email TEXT, role TEXT, is_active BOOLEAN) AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE phone = p_phone) THEN
    RAISE EXCEPTION 'Nomor HP sudah terdaftar';
  END IF;
  
  INSERT INTO profiles (full_name, phone, email, password_hash, role, is_active)
  VALUES (p_full_name, p_phone, p_email, hash_password(p_password), 'member', true)
  RETURNING id, full_name, phone, email, role, is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;