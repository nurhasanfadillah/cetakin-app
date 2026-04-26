-- Enhanced RLS Policies for Production
-- Migration: 002_enhanced_rls.sql

-- Drop permissive policies
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on orders" ON orders;
DROP POLICY IF EXISTS "Admins can do everything on order_files" ON order_files;
DROP POLICY IF EXISTS "Admins can do everything on invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can do everything on payments" ON payments;
DROP POLICY IF EXISTS "Admins can do everything on media_assets" ON media_assets;
DROP POLICY IF EXISTS "Admins can do everything on landing_page_sections" ON landing_page_sections;
DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON site_settings;

-- PROFILES Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ORDERS Policies
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Members can view own orders" ON orders
  FOR SELECT TO authenticated
  USING (
    member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

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

-- ORDER_FILES Policies
CREATE POLICY "Members can view own order files" ON order_files
  FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage order files" ON order_files
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- INVOICES Policies
CREATE POLICY "Members can view own invoices" ON invoices
  FOR SELECT TO authenticated
  USING (
    member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- PAYMENTS Policies
CREATE POLICY "Public can create payments" ON payments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Members can view own payments" ON payments
  FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- MEDIA_ASSETS Policies
CREATE POLICY "Public can view media assets" ON media_assets
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can view media assets" ON media_assets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage media assets" ON media_assets
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- LANDING_PAGE_SECTIONS Policies
CREATE POLICY "Public can read landing page sections" ON landing_page_sections
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Public can read landing page sections authenticated" ON landing_page_sections
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage landing page sections" ON landing_page_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- LANDING_PAGE_FAQS Policies
CREATE POLICY "Public can read FAQs" ON landing_page_faqs
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Public can read FAQs authenticated" ON landing_page_faqs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage FAQs" ON landing_page_faqs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- LANDING_PAGE_VALUE_CARDS Policies
CREATE POLICY "Public can read value cards" ON landing_page_value_cards
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage value cards" ON landing_page_value_cards
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- LANDING_PAGE_AUDIENCE_CARDS Policies
CREATE POLICY "Public can read audience cards" ON landing_page_audience_cards
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage audience cards" ON landing_page_audience_cards
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- LANDING_PAGE_ORDER_STEPS Policies
CREATE POLICY "Public can read order steps" ON landing_page_order_steps
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage order steps" ON landing_page_order_steps
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- SITE_SETTINGS Policies
CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- SEO_SETTINGS Policies
CREATE POLICY "Public can read SEO settings" ON seo_settings
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins can manage SEO settings" ON seo_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- TRACKING_SETTINGS Policies
CREATE POLICY "Public can read tracking settings" ON tracking_settings
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admins can manage tracking settings" ON tracking_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- SERVICES Policies
CREATE POLICY "Public can read active services" ON services
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read services" ON services
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- PRICE_LIST_ITEMS Policies
CREATE POLICY "Public can read active price list items" ON price_list_items
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage price list items" ON price_list_items
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ORDER_STATUS_HISTORY Policies
CREATE POLICY "Members can view own order history" ON order_status_history
  FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage order status history" ON order_status_history
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- AUDIT_LOGS Policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- PAYMENT_WEBHOOK_LOGS Policies (no RLS - handled by edge function)
CREATE POLICY "Admins can view webhook logs" ON payment_webhook_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Storage Buckets RLS
-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('order-files', 'order-files', true, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/illustrator', 'application/postscript']),
  ('media', 'media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view order files" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-files');

CREATE POLICY "Authenticated can upload order files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_profile()
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
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
