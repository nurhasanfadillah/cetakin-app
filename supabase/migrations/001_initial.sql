-- Migration for cetakin.com Supabase Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT CHECK (role IN ('member', 'admin', 'super_admin')) DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  member_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_type TEXT NOT NULL,
  estimated_size TEXT,
  deadline DATE,
  pickup_method TEXT CHECK (pickup_method IN ('pickup', 'shipping')) DEFAULT 'pickup',
  shipping_address TEXT,
  shipping_city TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  status TEXT DEFAULT 'MENUNGGU_REVIEW_FILE',
  estimated_price NUMERIC,
  final_price NUMERIC,
  shipping_cost NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC,
  payment_status TEXT DEFAULT 'UNPAID',
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_FILES TABLE
CREATE TABLE IF NOT EXISTS order_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  media_asset_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  member_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'DRAFT',
  subtotal NUMERIC NOT NULL,
  design_fee NUMERIC DEFAULT 0,
  layout_fee NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  invoice_id UUID REFERENCES invoices(id),
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  payment_link TEXT,
  status TEXT DEFAULT 'UNPAID',
  amount NUMERIC NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT_WEBHOOK_LOGS TABLE
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_type TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cocok_untuk TEXT,
  notes TEXT,
  base_price NUMERIC,
  price_label TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  media_asset_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICE_LIST_ITEMS TABLE
CREATE TABLE IF NOT EXISTS price_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  price_label TEXT NOT NULL,
  price NUMERIC,
  is_vendor_price BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA_ASSETS TABLE
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  bucket_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  alt_text TEXT,
  category TEXT,
  linked_section TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANDING_PAGE_SECTIONS TABLE
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  cta_primary_label TEXT,
  cta_primary_url TEXT,
  cta_secondary_label TEXT,
  cta_secondary_url TEXT,
  note TEXT,
  media_asset_id UUID REFERENCES media_assets(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANDING_PAGE_FAQS TABLE
CREATE TABLE IF NOT EXISTS landing_page_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANDING_PAGE_VALUE_CARDS TABLE
CREATE TABLE IF NOT EXISTS landing_page_value_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_asset_id UUID,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANDING_PAGE_AUDIENCE_CARDS TABLE
CREATE TABLE IF NOT EXISTS landing_page_audience_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  main_message TEXT,
  media_asset_id UUID,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANDING_PAGE_ORDER_STEPS TABLE
CREATE TABLE IF NOT EXISTS landing_page_order_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_asset_id UUID,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  og_title TEXT,
  og_description TEXT,
  og_image_id UUID REFERENCES media_assets(id),
  canonical_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRACKING_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS tracking_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_ads_conversion_id TEXT,
  google_ads_conversion_label TEXT,
  ga4_measurement_id TEXT,
  enable_google_ads BOOLEAN DEFAULT false,
  enable_ga4 BOOLEAN DEFAULT false,
  test_mode BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_STATUS_HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA

-- Seed default services
INSERT INTO services (title, slug, description, cocok_untuk, is_active, sort_order) VALUES
('Print DTF Meteran', 'print-dtf-meteran', 'Cocok untuk vendor, reseller, dan konveksi yang membutuhkan cetak transfer DTF berdasarkan panjang meter.', 'Order customer, desain full color, logo, nama, nomor, merchandise, dan produksi berulang.', true, 1),
('Print Banyak Desain Sekaligus', 'print-banyak-desain', 'Susun banyak desain, logo, nama, atau variasi ukuran dalam satu area cetak agar lebih efisien.', 'Reseller, brand lokal, vendor sablon, dan customer yang ingin memaksimalkan area cetak.', true, 2),
('Maklon Print DTF Vendor', 'maklon-vendor', 'Untuk vendor sablon dan konveksi yang membutuhkan partner print DTF transfer siap press.', 'Vendor yang sudah punya customer, kaos, dan heat press, tetapi butuh partner print DTF.', true, 3),
('Bantuan Layout Hemat Area Cetak', 'bantuan-layout', 'Kami dapat membantu menyusun file ke dalam layout cetak agar area lebih efisien.', 'File yang sudah siap cetak.', true, 4),
('Bantu Desain Ringan', 'bantu-desain', 'Kami bisa bantu optimalkan kualitas gambar, merapikan file sederhana, menyesuaikan ukuran.', 'Gratis untuk kebutuhan ringan.', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed company settings
INSERT INTO site_settings (key, value) VALUES
('company', '{"name": "cetakin.com", "companyName": "PT. REDONE BERKAH MANDIRI UTAMA", "whatsapp": "6282113133165", "address": "Jl. Raya Cileungsi - Jonggol Km. 10 RT 004/002, Cipeucang, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820"}'),
('whatsapp_config', '{"enabled": true, "stickyLabel": "Chat WhatsApp", "prefilledMessage": "Halo, saya ingin print DTF transfer siap press."}')
ON CONFLICT (key) DO NOTHING;

-- Seed tracking settings (disabled by default)
INSERT INTO tracking_settings (enable_google_ads, enable_ga4, test_mode) VALUES (false, false, true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public read for landing page content
CREATE POLICY "Public can read landing_page_sections" ON landing_page_sections FOR SELECT USING (true);
CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read services" ON services FOR SELECT USING (is_active = true);

-- Admin full access (simplified - in production, check auth.uid())
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Admins can do everything on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Admins can do everything on order_files" ON order_files FOR ALL USING (true);
CREATE POLICY "Admins can do everything on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Admins can do everything on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Admins can do everything on media_assets" ON media_assets FOR ALL USING (true);
CREATE POLICY "Admins can do everything on landing_page_sections" ON landing_page_sections FOR ALL USING (true);
CREATE POLICY "Admins can do everything on site_settings" ON site_settings FOR ALL USING (true);

-- Insert triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at();