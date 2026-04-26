-- Migration: Fix RLS Policies — Replace overly permissive USING (true) with proper role checks
-- This migration should be run AFTER setting up Supabase Auth or custom auth RPC functions.

-- ═══════════════════════════════════════════════════════════════════
--  HELPER: Function to check if current user is admin
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.profiles
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
--  DROP old overly-permissive policies
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on orders" ON orders;
DROP POLICY IF EXISTS "Admins can do everything on order_files" ON order_files;
DROP POLICY IF EXISTS "Admins can do everything on invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can do everything on payments" ON payments;
DROP POLICY IF EXISTS "Admins can do everything on media_assets" ON media_assets;
DROP POLICY IF EXISTS "Admins can do everything on landing_page_sections" ON landing_page_sections;
DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON site_settings;

-- ═══════════════════════════════════════════════════════════════════
--  PROFILES — Users read own, admins read/write all
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins full access profiles"
  ON profiles FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  ORDERS — Members see own, admins see all, public can insert
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Members can view own orders"
  ON orders FOR SELECT
  USING (
    member_id = public.current_profile_id()
    OR public.is_admin()
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  ORDER_FILES — tied to order access
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Public can insert order files"
  ON order_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own order files"
  ON order_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_files.order_id
      AND (orders.member_id = public.current_profile_id() OR public.is_admin())
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins full access order files"
  ON order_files FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  INVOICES — Members see own, admins manage
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Members can view own invoices"
  ON invoices FOR SELECT
  USING (
    member_id = public.current_profile_id()
    OR public.is_admin()
  );

CREATE POLICY "Admins full access invoices"
  ON invoices FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  PAYMENTS — Members see own, admins manage
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Members can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.member_id = public.current_profile_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins full access payments"
  ON payments FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  MEDIA_ASSETS — Public read, admins write
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Public can read media assets"
  ON media_assets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage media assets"
  ON media_assets FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  LANDING PAGE & SETTINGS — Public read, admins write
-- ═══════════════════════════════════════════════════════════════════

-- landing_page_sections already has public read policy, keep it
-- Drop and recreate admin write policy
DROP POLICY IF EXISTS "Public can read landing_page_sections" ON landing_page_sections;
CREATE POLICY "Public can read active sections"
  ON landing_page_sections FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage sections"
  ON landing_page_sections FOR ALL
  USING (public.is_admin());

-- site_settings already has public read policy, keep it
DROP POLICY IF EXISTS "Public can read site_settings" ON site_settings;
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  ENABLE RLS on previously unprotected tables
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE landing_page_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_value_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_audience_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_order_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public read policies for landing page content tables
CREATE POLICY "Public can read active FAQs" ON landing_page_faqs FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage FAQs" ON landing_page_faqs FOR ALL USING (public.is_admin());

CREATE POLICY "Public can read active value cards" ON landing_page_value_cards FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage value cards" ON landing_page_value_cards FOR ALL USING (public.is_admin());

CREATE POLICY "Public can read active audience cards" ON landing_page_audience_cards FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage audience cards" ON landing_page_audience_cards FOR ALL USING (public.is_admin());

CREATE POLICY "Public can read active order steps" ON landing_page_order_steps FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage order steps" ON landing_page_order_steps FOR ALL USING (public.is_admin());

-- Services & price list — public read active, admin manage
DROP POLICY IF EXISTS "Public can read services" ON services;
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage services" ON services FOR ALL USING (public.is_admin());

CREATE POLICY "Public can read active price items" ON price_list_items FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage price items" ON price_list_items FOR ALL USING (public.is_admin());

-- Admin-only tables
CREATE POLICY "Admins can read order status history" ON order_status_history FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert status history" ON order_status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read audit logs" ON audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage tracking settings" ON tracking_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Public can read tracking settings" ON tracking_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage SEO settings" ON seo_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Public can read SEO settings" ON seo_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage webhook logs" ON payment_webhook_logs FOR ALL USING (public.is_admin());
