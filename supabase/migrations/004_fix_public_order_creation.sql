-- Fix RLS for Public Order Creation (Idempotent)
-- Migration: 004_fix_public_order_creation.sql

-- ORDERS Policies - Drop and recreate
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view orders" ON orders;
CREATE POLICY "Public can view orders" ON orders
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

-- ORDER_FILES Policies
DROP POLICY IF EXISTS "Public can create order files" ON order_files;
CREATE POLICY "Public can create order files" ON order_files
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order files" ON order_files;
CREATE POLICY "Public can view order files" ON order_files
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated can view order files" ON order_files;
CREATE POLICY "Authenticated can view order files" ON order_files
  FOR SELECT TO authenticated
  USING (true);

-- PAYMENTS Policies
DROP POLICY IF EXISTS "Public can create payments" ON payments;
CREATE POLICY "Public can create payments" ON payments
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view payments" ON payments;
CREATE POLICY "Public can view payments" ON payments
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated can view payments" ON payments;
CREATE POLICY "Authenticated can view payments" ON payments
  FOR SELECT TO authenticated
  USING (true);

-- INVOICES Policies
DROP POLICY IF EXISTS "Public can view invoices" ON invoices;
CREATE POLICY "Public can view invoices" ON invoices
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated can view invoices" ON invoices;
CREATE POLICY "Authenticated can view invoices" ON invoices
  FOR SELECT TO authenticated
  USING (true);

-- Storage Policies for order-files bucket
DROP POLICY IF EXISTS "Public can upload order files" ON storage.objects;
CREATE POLICY "Public can upload order files" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'order-files');

DROP POLICY IF EXISTS "Public can view order files storage" ON storage.objects;
CREATE POLICY "Public can view order files storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-files');