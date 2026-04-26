-- Fix RLS for Public Order Creation
-- Migration: 004_fix_public_order_creation.sql

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Members can view own orders" ON orders;
DROP POLICY IF EXISTS "Members can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Members can view own order files" ON order_files;
DROP POLICY IF EXISTS "Admins can manage order files" ON order_files;
DROP POLICY IF EXISTS "Authenticated can upload order files" ON storage.objects;
DROP POLICY IF EXISTS "Members can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

-- ORDERS Policies - Allow public create, authenticated view/update, admin manage
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view orders" ON orders
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Members can update own orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ORDER_FILES Policies - Allow public insert, authenticated/admin manage
CREATE POLICY "Public can create order files" ON order_files
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view order files" ON order_files
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can view order files" ON order_files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage order files" ON order_files
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- PAYMENTS Policies - Allow public insert
CREATE POLICY "Public can create payments" ON payments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view payments" ON payments
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can view payments" ON payments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- INVOICES Policies - Allow public view
CREATE POLICY "Public can view invoices" ON invoices
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can view invoices" ON invoices
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Storage Policies - Allow public upload for order-files bucket
DROP POLICY IF EXISTS "Authenticated can upload order files" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload order files" ON storage.objects;

CREATE POLICY "Public can upload order files" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'order-files');

CREATE POLICY "Public can view order files" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-files');

CREATE POLICY "Public can update order files" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'order-files');

CREATE POLICY "Public can delete order files" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'order-files');