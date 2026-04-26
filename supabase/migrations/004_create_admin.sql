-- Create Admin User
-- Run this in Supabase Dashboard → SQL Editor

-- Example: Create admin with phone 081234567890 and password admin123
-- IMPORTANT: Change the password after first login!

INSERT INTO profiles (full_name, phone, email, password_hash, role, is_active)
VALUES (
  'Admin',
  '081234567890',
  'admin@cetakin.com',
  crypt('admin123', gen_salt('bf')),
  'admin',
  true
)
ON CONFLICT (phone) DO UPDATE
SET 
  password_hash = crypt('admin123', gen_salt('bf')),
  role = 'admin',
  is_active = true;

-- After creating, you can login with:
-- Phone: 081234567890
-- Password: admin123

-- Remember to change the password after first login!