-- Login function
CREATE OR REPLACE FUNCTION login_with_phone(x_phone TEXT, x_password TEXT)
RETURNS TABLE (
  id UUID, auth_user_id UUID, full_name TEXT, phone TEXT, email TEXT,
  role TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
) AS $$
DECLARE v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE phone = x_phone LIMIT 1;
  IF v_profile.id IS NULL THEN RAISE EXCEPTION 'Nomor HP tidak terdaftar'; END IF;
  IF NOT v_profile.is_active THEN RAISE EXCEPTION 'Akun tidak aktif'; END IF;
  IF v_profile.password_hash IS NULL THEN RAISE EXCEPTION 'Password belum diatur'; END IF;
  IF NOT verify_password(x_password, v_profile.password_hash) THEN RAISE EXCEPTION 'Password salah'; END IF;
  RETURN QUERY SELECT * FROM profiles WHERE id = v_profile.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register function (all params required)
CREATE OR REPLACE FUNCTION register_with_phone(x_full_name TEXT, x_phone TEXT, x_password TEXT, x_email TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, phone TEXT, email TEXT, role TEXT, is_active BOOLEAN) AS $$
DECLARE v_profile profiles%ROWTYPE; v_new_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE phone = x_phone LIMIT 1;
  IF v_profile.id IS NOT NULL THEN RAISE EXCEPTION 'Nomor HP sudah terdaftar'; END IF;
  INSERT INTO profiles (full_name, phone, email, password_hash, role, is_active)
  VALUES (x_full_name, x_phone, x_email, hash_password(x_password), 'member', true)
  RETURNING * INTO v_new_profile;
  RETURN QUERY SELECT id, full_name, phone, email, role, is_active FROM profiles WHERE id = v_new_profile.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;