-- Fix RLS: Allow authenticated users to UPDATE orders
-- Migration: 005_allow_order_updates.sql
-- This fixes the issue where admin cannot edit order prices

-- Drop existing restrictive UPDATE/DELETE policies
DROP POLICY IF EXISTS "Authenticated can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can update order files" ON order_files;
DROP POLICY IF EXISTS "Authenticated can update payments" ON payments;
DROP POLICY IF EXISTS "Authenticated can update invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated can update storage files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete storage files" ON storage.objects;

-- For now, use service_role bypass (simplified approach for dev)
-- In production, implement proper auth.uid() based policies

-- ORDERS - Allow all authenticated updates
CREATE POLICY "Allow authenticated updates on orders" ON orders
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on orders" ON orders
  FOR DELETE TO authenticated
  USING (true);

-- ORDER_FILES
CREATE POLICY "Allow authenticated updates on order_files" ON order_files
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on order_files" ON order_files
  FOR DELETE TO authenticated
  USING (true);

-- PAYMENTS
CREATE POLICY "Allow authenticated updates on payments" ON payments
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on payments" ON payments
  FOR DELETE TO authenticated
  USING (true);

-- INVOICES
CREATE POLICY "Allow authenticated updates on invoices" ON invoices
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on invoices" ON invoices
  FOR DELETE TO authenticated
  USING (true);

-- Storage
CREATE POLICY "Allow authenticated updates on storage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (true);