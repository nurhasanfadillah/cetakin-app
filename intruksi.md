# PROMPT UNTUK AI CODING AGENT DI IDE

Anda adalah senior full-stack web app engineer, product-minded frontend architect, UI/UX engineer, dan conversion-focused landing page builder.

Bangun aplikasi web untuk brand **cetakin.com** milik **PT. REDONE BERKAH MANDIRI UTAMA**.

Produk ini bukan hanya landing page statis. Bangun sebagai:

**Landing Page + CMS Konten & Media Asset + Order Cepat + Upload File + Member Area + Admin Dashboard + Invoice + Payment Link Flow + SEO/Tracking Config**

Gunakan pendekatan mobile-first, conversion-focused, accessible, scalable, dan maintainable.

---

# 1. KONTEKS BISNIS

## Brand
- Nama brand: **cetakin.com**
- Nama perusahaan: **PT. REDONE BERKAH MANDIRI UTAMA**
- Nomor WhatsApp: **082113133165**
- Format internasional WhatsApp: **6282113133165**

## Alamat workshop
Jl. Raya Cileungsi - Jonggol Km. 10 RT 004/002, Cipeucang, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820

## Jenis layanan
cetakin.com menyediakan layanan **print DTF transfer siap press** untuk:
- vendor sablon
- konveksi kecil
- reseller kaos custom
- brand lokal
- kebutuhan produksi apparel

## Positioning
cetakin.com adalah partner print DTF transfer siap press untuk vendor sablon, konveksi kecil, reseller, dan brand lokal yang membutuhkan hasil cetak praktis, rapi, dan siap digunakan untuk produksi apparel.

## Catatan penting messaging
JANGAN gunakan angle marketing:
- “belum punya mesin”
- “tanpa beli mesin”
- “tidak perlu investasi printer”

Gunakan angle:
- partner produksi
- print DTF siap press
- file dicek dulu
- bisa bantu layout hemat area cetak
- bisa bantu desain ringan
- bisa ambil di workshop atau kirim ekspedisi
- proses mudah via order cepat atau WhatsApp

## Istilah yang harus dihindari
JANGAN gunakan kata **gangsheet** sebagai istilah utama.

Gunakan istilah yang lebih mudah dipahami:
- layout hemat area cetak
- cetak banyak desain sekaligus
- susun banyak desain dalam satu area cetak
- file layout siap cetak
- print DTF meteran dengan layout efisien

Kata “gangsheet” hanya boleh muncul sangat terbatas di FAQ atau SEO sebagai istilah alternatif, misalnya:
“Sebagian orang menyebutnya gangsheet, tetapi di cetakin.com kami menyebutnya layout hemat area cetak.”

---

# 2. TUJUAN PRODUK

Bangun aplikasi web yang mendukung funnel:

**Google Search / Google Ads → Landing Page → Order Cepat / WhatsApp → Review Admin → Invoice → Payment Link → Produksi → Member Area**

Tujuan utama:
1. Meningkatkan inquiry dan order dari Google Search/Ads.
2. Memudahkan customer mengirim file desain.
3. Memudahkan admin mengecek file dan menentukan harga final.
4. Memudahkan customer membayar setelah file dan harga disetujui.
5. Memudahkan member melihat status pesanan, riwayat pesanan, dan invoice.
6. Memudahkan admin mengedit seluruh konten landing page, termasuk teks dan aset visual, tanpa mengubah kode.

---

# 3. STACK TEKNIS

Gunakan stack berikut:

## Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- React Hook Form
- Zod
- TanStack Query untuk async state dan admin dashboard
- React Router atau routing yang setara

## Backend / Data
- Supabase Database
- Supabase Auth atau custom auth berbasis Supabase
- Supabase Storage
- Supabase Row Level Security
- Supabase Edge Functions atau Netlify Functions untuk payment webhook dan server-side logic

## Deployment
- Netlify

## Payment
- Buat **payment provider adapter**
- Implementasi awal diarahkan ke **Midtrans**
- Struktur harus mudah diganti ke Xendit/Duitku di masa depan
- Jangan hardcode payment logic langsung di UI
- Payment dilakukan setelah admin review file dan approve harga final

## Analytics & Tracking
Siapkan config untuk:
- Google Ads Conversion ID
- Google Ads Conversion Label
- GA4 Measurement ID
- WhatsApp CTA event
- Order submit event
- File upload event
- Payment link generated event
- Payment success event

Semua ID tracking harus bisa diedit dari panel admin.

---

# 4. ARSITEKTUR HALAMAN

Bangun route minimal:

## Public
- `/` — landing page utama
- `/order` — order cepat
- `/order/success/:orderNumber` — order berhasil dibuat
- `/login` — login member/admin
- `/register` — register member sederhana jika diperlukan
- `/member` — dashboard member
- `/member/orders` — riwayat pesanan member
- `/member/orders/:id` — detail pesanan
- `/member/invoices/:id` — invoice view/print/download

## Admin
- `/admin` — admin dashboard
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/members`
- `/admin/invoices`
- `/admin/payments`
- `/admin/files`
- `/admin/media`
- `/admin/price-list`
- `/admin/content`
- `/admin/content/landing-page`
- `/admin/seo-tracking`
- `/admin/whatsapp`
- `/admin/company`
- `/admin/settings`

---

# 5. LANDING PAGE REQUIREMENTS

Landing page harus conversion-focused, mobile-first, cepat, dan mudah discan.

## Primary CTA
- **Order Cepat**
- **Cek File & Harga via WhatsApp**

## Secondary CTA
- **Minta Price List Vendor**

## Struktur landing page
Bangun section berikut:

1. Header/navigation
2. Hero section
3. Problem section
4. Solution section
5. Target audience cards
6. Value proposition cards
7. Services section
8. Price list placeholder section
9. Order cepat teaser section
10. Cara order
11. Syarat file
12. Bantu desain ringan
13. Disclaimer penting
14. FAQ accordion
15. Lokasi workshop
16. Closing CTA
17. Footer
18. Sticky WhatsApp button

---

# 6. COPY DEFAULT LANDING PAGE

Gunakan copy default berikut sebagai seed content. Semua copy ini harus bisa diedit dari admin panel.

## Meta Title
Print DTF Meteran Siap Press untuk Vendor dan Reseller | cetakin.com

## Meta Description
Jasa print DTF transfer siap press untuk vendor sablon, konveksi kecil, reseller, dan brand lokal. Kirim file, cek harga, ambil di Cileungsi atau kirim via ekspedisi.

## Hero Headline
Print DTF Transfer Siap Press untuk Vendor, Reseller & Brand Lokal

## Hero Subheadline
cetakin.com membantu vendor sablon, konveksi kecil, reseller, dan brand lokal mencetak transfer DTF meteran yang rapi, praktis, dan siap press. Kirim file desain Anda, kami bantu cek dan cetak untuk kebutuhan produksi Anda.

## Primary CTA
Order Cepat

## Secondary CTA
Cek File & Harga via WhatsApp

## Note kecil
Layanan belum termasuk kaos dan jasa press.

---

## Problem Section

### Judul
Butuh Partner Print DTF untuk Produksi Harian?

### Copy
Order sablon full color, desain custom, logo komunitas, nama berbeda, hingga mini drop brand lokal sering membutuhkan proses cetak yang cepat, rapi, dan fleksibel.

cetakin.com hadir sebagai partner print DTF transfer siap press untuk membantu kebutuhan produksi vendor sablon, konveksi kecil, reseller, dan brand lokal.

Anda cukup kirim file desain. Kami bantu cek file, susun layout bila diperlukan, lalu cetak transfer DTF siap press. Setelah itu hasil bisa Anda press ke kaos, hoodie, tote bag, atau produk apparel lainnya.

### CTA kecil
Minta Price List Vendor

---

## Solution Section

### Judul
Solusi Print DTF Siap Press untuk Kebutuhan Produksi Anda

### Copy
Kami fokus pada layanan print DTF transfer siap press, bukan kaos jadi. Layanan ini cocok untuk Anda yang sudah memiliki kaos, heat press, atau proses produksi sendiri, tetapi membutuhkan partner cetak DTF yang rapi, praktis, dan siap digunakan.

### Benefit
- Print DTF meteran
- Cocok untuk vendor sablon, konveksi kecil, reseller, dan brand lokal
- Bisa bantu cek file sebelum produksi
- Bisa bantu layout hemat area cetak
- Transfer dikirim dalam kondisi siap press
- Tersedia harga vendor untuk repeat order
- Bisa bantu desain ringan untuk optimasi kualitas gambar
- Proses order mudah via order cepat atau WhatsApp

---

## Target Audience

### Judul
Layanan Ini Cocok untuk Siapa?

### Card 1
Title: Vendor Sablon  
Description: Terima kebutuhan print DTF full color untuk customer Anda dengan proses yang praktis dan siap press. Cocok untuk sablon rumahan, vendor kaos custom, dan usaha sablon kecil.  
Pesan utama: Partner print DTF untuk kebutuhan produksi harian.

### Card 2
Title: Konveksi Kecil  
Description: Tambahkan layanan sablon DTF untuk customer Anda dengan alur produksi yang lebih fleksibel dan mudah dikontrol.  
Pesan utama: Tambah layanan DTF dengan partner produksi yang praktis.

### Card 3
Title: Reseller Kaos Custom  
Description: Anda siapkan kaos dan kebutuhan customer, cetakin.com bantu print transfer DTF-nya. Cocok untuk reseller yang ingin produksi sesuai order.  
Pesan utama: Jualan kaos custom dengan file siap press.

### Card 4
Title: Brand Lokal  
Description: Cetak transfer DTF untuk sample, mini drop, atau stok desain. Press saat order masuk agar produksi lebih fleksibel.  
Pesan utama: Tes desain dan mini drop dengan lebih fleksibel.

---

## Value Proposition

### Judul
Kenapa Print DTF di cetakin.com?

### Copy
cetakin.com membantu vendor, reseller, konveksi, dan brand lokal mendapatkan print DTF transfer siap press dengan proses yang rapi, praktis, dan mudah dikontrol.

### Value Cards
1. Siap Press  
Transfer DTF dicetak dan dikirim dalam kondisi siap digunakan. Cocok untuk Anda yang sudah punya heat press sendiri.

2. Layout Hemat Area Cetak  
Gabungkan banyak desain dalam satu area cetak agar lebih efisien dan hemat.

3. File Bisa Dicek  
Kami bantu cek file dari sisi ukuran, resolusi, background, dan kesiapan cetak sebelum produksi.

4. Bantu Desain Ringan  
Kami bisa bantu optimalkan kualitas gambar, merapikan file sederhana, atau membuat desain logo/desain ringan sesuai kebutuhan.

5. Harga Vendor  
Tersedia harga khusus untuk vendor, reseller, dan customer repeat order.

6. Proses Mudah  
Order bisa lewat form order cepat atau WhatsApp. Kirim file, cek estimasi, konfirmasi, produksi, lalu ambil atau kirim.

---

## Services

### Judul
Layanan Print DTF yang Tersedia

### Service 1
Title: Print DTF Meteran  
Description: Cocok untuk vendor, reseller, dan konveksi yang membutuhkan cetak transfer DTF berdasarkan panjang meter.  
Cocok untuk: order customer, desain full color, logo, nama, nomor, merchandise, dan produksi berulang.

### Service 2
Title: Print Banyak Desain Sekaligus  
Description: Susun banyak desain, logo, nama, atau variasi ukuran dalam satu area cetak agar lebih efisien.  
Cocok untuk: reseller, brand lokal, vendor sablon, dan customer yang ingin memaksimalkan area cetak.

### Service 3
Title: Maklon Print DTF Vendor  
Description: Untuk vendor sablon dan konveksi yang membutuhkan partner print DTF transfer siap press.  
Cocok untuk: vendor yang sudah punya customer, kaos, dan heat press, tetapi butuh partner print DTF.

### Service 4
Title: Bantuan Layout Hemat Area Cetak  
Description: Kami dapat membantu menyusun file ke dalam layout cetak agar area lebih efisien.  
Catatan: Bantuan layout berlaku untuk file yang sudah siap cetak. Edit desain berat, hapus background rumit, atau perbaikan file kompleks dapat dikenakan biaya tambahan setelah dikonfirmasi.

### Service 5
Title: Bantu Desain Ringan  
Description: Kami bisa bantu optimalkan kualitas gambar, merapikan file sederhana, menyesuaikan ukuran, atau membuat desain logo/desain ringan.  
Catatan: Gratis untuk kebutuhan ringan. Desain kompleks, tracing rumit, atau revisi besar akan dikonfirmasi terlebih dahulu.

---

## Cara Order

1. Kirim File Desain  
Kirim file desain lewat order cepat atau WhatsApp. Format bisa berupa PNG transparan, PDF, AI, CDR, PSD, ZIP, atau format lain yang bisa kami cek.

2. Kami Cek File  
Kami bantu cek ukuran, resolusi, background, dan kesiapan file untuk dicetak.

3. Estimasi & Harga Final  
Sistem dapat menampilkan estimasi awal. Harga final akan dikonfirmasi admin setelah file dicek.

4. Invoice & Payment Link  
Setelah file dan harga disetujui, sistem membuat invoice dan payment link.

5. Produksi Print DTF  
Setelah pembayaran berhasil, file diproses menjadi transfer DTF siap press.

6. Ambil atau Kirim  
Hasil print bisa diambil langsung di workshop cetakin.com atau dikirim ke alamat Anda via ekspedisi.

---

## Syarat File

Agar hasil print lebih maksimal, pastikan file desain sudah sesuai ketentuan berikut:

- File disarankan dalam format PNG transparan, PDF, AI, CDR, PSD, atau ZIP
- Resolusi tinggi dan tidak pecah
- Background transparan jika desain tidak ingin berbentuk kotak
- Ukuran desain sudah jelas
- Warna pada layar bisa sedikit berbeda dengan hasil cetak
- File blur, kecil, atau pecah akan memengaruhi hasil print
- Untuk cetak banyak desain sekaligus, beri jarak aman antar desain agar mudah dipotong

CTA:
Ragu file Anda sudah siap cetak? Kirim File untuk Kami Cek.

---

## Disclaimer

### Judul
Penting Sebelum Order

### Copy
Layanan kami khusus untuk print DTF transfer siap press.

Kami tidak menyediakan kaos dan tidak termasuk jasa press.

Hasil akhir setelah ditempel dapat dipengaruhi oleh:
- jenis kain
- suhu press
- tekanan press
- durasi press
- cara peel
- second press
- teknik pencucian

Kami dapat memberikan panduan press dasar untuk membantu Anda mendapatkan hasil terbaik.

---

## FAQ

Q: Apakah layanan ini sudah termasuk kaos?  
A: Belum. Kami hanya menyediakan jasa print DTF transfer siap press.

Q: Apakah sudah termasuk jasa press?  
A: Belum. Transfer DTF dikirim dalam bentuk siap press. Layanan ini cocok untuk customer yang sudah punya heat press sendiri.

Q: Bisa order untuk vendor sablon atau konveksi?  
A: Bisa. Kami melayani vendor sablon, konveksi kecil, reseller, dan brand lokal.

Q: Bisa bantu layout hemat area cetak?  
A: Bisa, selama file sudah siap cetak. Jika file perlu edit berat, kami akan informasikan terlebih dahulu.

Q: Bisa bantu desain?  
A: Bisa untuk desain ringan, optimasi kualitas gambar, desain logo sederhana, atau perapihan file dasar. Untuk desain kompleks akan dikonfirmasi terlebih dahulu.

Q: File dari Canva bisa dicetak?  
A: Bisa dicek dulu. Pastikan file memiliki resolusi yang cukup dan background sesuai kebutuhan.

Q: Bisa kirim luar kota?  
A: Bisa. Transfer DTF bisa dikirim sesuai alamat tujuan via ekspedisi.

Q: Bisa ambil langsung?  
A: Bisa. Anda dapat mengambil hasil print langsung di workshop cetakin.com.

Q: Kalau hasil press gagal, apakah diganti?  
A: Kami bertanggung jawab jika terdapat cacat produksi pada hasil print. Namun proses press, suhu, tekanan, bahan kain, dan teknik aplikasi berada di luar kendali kami.

Q: Bisa dapat harga vendor?  
A: Bisa. Harga vendor tersedia untuk repeat order atau pembelian dengan jumlah tertentu.

---

## Closing CTA

### Headline
Siap Print DTF untuk Kebutuhan Produksi Anda?

### Copy
Kirim file desain Anda sekarang. cetakin.com bantu cek file, hitungkan kebutuhan cetak, dan siapkan transfer DTF siap press untuk kebutuhan produksi Anda.

### CTA
Order Cepat

### Secondary CTA
Cek File & Harga via WhatsApp

---

# 7. ORDER CEPAT

Bangun halaman `/order` dengan form minimal.

## Field order cepat
- Nama customer
- Nomor WhatsApp
- Email opsional
- Password opsional atau checkbox “Buat akun untuk cek status & riwayat pesanan”
- Jenis layanan:
  - Print DTF Meteran
  - Print Banyak Desain Sekaligus
  - Maklon Print DTF Vendor
  - Bantuan Layout Hemat Area Cetak
  - Bantu Desain Ringan
- Estimasi ukuran / panjang
- Deadline
- Metode pengambilan:
  - Ambil di Workshop
  - Kirim Ekspedisi
- Alamat pengiriman jika pilih kirim
- Kota pengiriman
- Catatan order
- Upload file desain

## Upload file order
File order customer harus disimpan ke Supabase Storage bucket:
- `order-files`

Folder:
- `order-files/customer-uploads/{orderNumber}/`

Format file yang diterima:
- PNG
- JPG/JPEG
- PDF
- AI
- CDR
- PSD
- ZIP

Buat validasi:
- required minimal 1 file
- maksimal ukuran file configurable dari admin
- validasi mime type / extension
- tampilkan progress upload
- tampilkan error upload yang jelas

## Setelah submit order
- Buat nomor order otomatis
- Simpan data order ke database
- Simpan file path ke database
- Status awal: `MENUNGGU_REVIEW_FILE`
- Tampilkan halaman sukses
- Berikan CTA:
  - “Cek Status Pesanan”
  - “Lanjut Chat WhatsApp”
- Jangan langsung meminta pembayaran sebelum admin review file

---

# 8. PAYMENT FLOW

Pembayaran dilakukan setelah admin review file dan approve harga final.

## Flow
1. Customer submit order
2. Admin cek file
3. Admin isi harga final
4. Admin isi ongkir jika diperlukan
5. Admin approve order
6. Sistem generate invoice
7. Sistem generate payment link
8. Customer bayar
9. Payment gateway webhook mengupdate status pembayaran
10. Order masuk produksi

## Status pembayaran
- `UNPAID`
- `PENDING`
- `PAID`
- `EXPIRED`
- `FAILED`
- `REFUNDED`

## Payment provider adapter
Buat interface:
- `createPaymentLink(order, invoice)`
- `handleWebhook(payload)`
- `getPaymentStatus(paymentId)`
- `cancelPayment(paymentId)`

Implementasi awal:
- `MidtransPaymentProvider`

Buat config payment di admin:
- provider aktif
- server key
- client key
- merchant id
- environment sandbox/production
- callback/webhook URL
- payment link expiry duration

Jangan expose secret key di frontend.

---

# 9. MEMBER AREA

Member login menggunakan:
- nomor handphone
- password

Order cepat boleh dilakukan tanpa login. Namun jika user centang buat akun atau mengisi password, buat akun member otomatis dari nomor HP.

## Fitur member
- login
- register sederhana
- logout
- dashboard
- lihat daftar pesanan
- lihat detail pesanan
- lihat status pesanan
- lihat status pembayaran
- lihat riwayat pesanan
- lihat invoice
- print invoice
- download invoice PDF
- repeat order

## Status order
Gunakan status:
- `MENUNGGU_REVIEW_FILE`
- `FILE_PERLU_REVISI`
- `MENUNGGU_APPROVAL_HARGA`
- `INVOICE_DITERBITKAN`
- `MENUNGGU_PEMBAYARAN`
- `PEMBAYARAN_BERHASIL`
- `MASUK_PRODUKSI`
- `SELESAI_PRODUKSI`
- `SIAP_DIAMBIL`
- `DIKIRIM`
- `SELESAI`
- `DIBATALKAN`

Tampilkan status dengan bahasa Indonesia yang mudah dipahami.

---

# 10. INVOICE

Invoice dibuat setelah admin approve order.

## Status invoice
- `DRAFT`
- `ISSUED`
- `PAID`
- `CANCELLED`

## Isi invoice
- nomor invoice
- tanggal order
- tanggal invoice
- nama customer
- nomor WhatsApp
- layanan
- detail order
- biaya print
- biaya desain jika ada
- biaya layout jika ada
- ongkir jika ada
- diskon jika ada
- total
- status pembayaran
- metode pembayaran
- payment link
- alamat perusahaan
- nama perusahaan
- catatan invoice

## Fitur invoice
- view invoice
- print dari browser
- download PDF
- admin bisa cetak invoice
- member bisa cetak invoice
- invoice memakai brand cetakin.com dan PT. REDONE BERKAH MANDIRI UTAMA

---

# 11. ADMIN DASHBOARD

Bangun admin dashboard dengan UI yang rapi, compact, mudah digunakan, dan cocok untuk operasional.

## Menu admin
1. Dashboard
2. Orders
3. Members
4. Invoices
5. Payments
6. Files / Order Files
7. Media Library
8. Price List
9. Landing Page Content
10. SEO & Tracking
11. WhatsApp Config
12. Company Profile
13. Settings

## Admin dashboard features

### Dashboard
- ringkasan order baru
- order menunggu review
- order menunggu pembayaran
- order masuk produksi
- order selesai
- total order bulan ini
- total revenue paid
- shortcut ke order baru

### Orders
- list order
- filter status
- search by order number, nama, nomor WA
- detail order
- preview/download file
- update status order
- catatan internal admin
- input harga final
- input ongkir
- approve order
- generate invoice
- generate payment link
- input resi
- update status kirim/ambil

### Members
- list member
- detail member
- riwayat order member
- reset password manual jika diperlukan
- disable/enable account

### Invoices
- list invoice
- detail invoice
- print invoice
- download PDF
- status invoice
- cancel invoice

### Payments
- list payment
- status payment
- provider payment
- webhook log
- manual mark as paid dengan confirmation modal dan audit log

### Files / Order Files
- list file customer
- filter by order
- preview jika file image/PDF
- download file
- lihat metadata file

### Media Library
Admin dapat mengelola aset landing page dan aset brand.

Fitur:
- upload gambar/aset
- preview gambar
- replace file
- delete file
- copy public URL/path
- edit alt text
- edit kategori
- pilih gambar untuk section tertentu
- simpan file ke Supabase Storage
- simpan metadata ke database

### Price List
- CRUD layanan dan harga
- harga placeholder
- status tampil/sembunyi
- catatan harga
- minimum order
- harga vendor
- harga layout
- layanan bantu desain ringan
- max upload size config

### Landing Page Content
Admin bisa mengedit seluruh konten landing page:
- teks
- heading
- subheading
- CTA label
- FAQ
- service cards
- benefit cards
- audience cards
- order steps
- disclaimer
- syarat file
- closing CTA
- footer
- status aktif/nonaktif section
- urutan item
- pilih media asset untuk setiap section

### SEO & Tracking
- meta title
- meta description
- OG title
- OG description
- OG image dari Supabase Storage
- canonical URL
- Google Ads conversion ID
- Google Ads conversion label
- GA4 measurement ID
- tracking enabled/disabled
- test mode

### WhatsApp Config
- nomor WhatsApp
- tombol sticky label
- pre-filled message
- CTA WhatsApp label
- toggle sticky WhatsApp

Default pre-filled message:
Halo, saya ingin print DTF transfer siap press.

Kebutuhan saya:
- Jenis order: Print DTF Meteran / Print Banyak Desain Sekaligus / Vendor / Bantu Desain
- Ukuran desain:
- Jumlah atau estimasi panjang:
- Deadline:
- Kota pengiriman:
- File desain: akan saya kirim

Mohon dibantu cek file dan estimasi harganya.

### Company Profile
- nama brand
- nama perusahaan
- alamat workshop
- nomor WhatsApp
- email opsional
- jam operasional
- logo
- favicon
- alamat Google Maps embed opsional
- footer copy

---

# 12. CMS KONTEN & MEDIA LANDING PAGE

Landing page tidak boleh hardcode teks dan gambar utama.

Semua konten landing page harus berasal dari:
- database Supabase
- Supabase Storage untuk aset media

Tetap sediakan fallback seed content agar halaman tetap tampil jika data belum ada.

## Media buckets
Buat Supabase Storage buckets:
- `landing-page-assets`
- `order-files`
- `company-assets`
- `seo-assets`
- `invoice-assets`

## Struktur folder storage
- `landing-page-assets/hero/`
- `landing-page-assets/services/`
- `landing-page-assets/sections/`
- `landing-page-assets/audience/`
- `landing-page-assets/value-cards/`
- `company-assets/logo/`
- `company-assets/favicon/`
- `seo-assets/og/`
- `invoice-assets/logo/`
- `order-files/customer-uploads/{orderNumber}/`

## Media validation
- Image: jpg, jpeg, png, webp, svg
- Document/order file: png, jpg, jpeg, pdf, ai, cdr, psd, zip
- File size configurable
- Show upload progress
- Show preview
- Require alt text for public-facing images
- Store metadata in database

## Media asset table fields
Buat tabel `media_assets`:
- id
- file_name
- file_path
- public_url
- bucket_name
- mime_type
- file_size
- alt_text
- category
- linked_section
- uploaded_by
- created_at
- updated_at

## Landing page content model
Gunakan pendekatan hybrid:
- global settings di `site_settings`
- SEO di `seo_settings`
- content section di `landing_page_sections`
- item berulang di tabel khusus

Tabel yang disarankan:
- `landing_page_sections`
- `landing_page_content_blocks`
- `landing_page_services`
- `landing_page_faqs`
- `landing_page_value_cards`
- `landing_page_audience_cards`
- `landing_page_order_steps`
- `media_assets`
- `site_settings`
- `seo_settings`
- `tracking_settings`

Setiap section/item yang membutuhkan media punya field:
- `media_asset_id`
- `image_alt`
- `is_active`
- `sort_order`

---

# 13. DATABASE DESIGN

Buat SQL migration untuk Supabase.

Tabel minimal:

## profiles
- id uuid primary key
- auth_user_id uuid nullable
- full_name text
- phone text unique
- email text nullable
- role text check in ('member','admin','super_admin')
- is_active boolean
- created_at timestamptz
- updated_at timestamptz

## orders
- id uuid primary key
- order_number text unique
- member_id uuid nullable references profiles(id)
- customer_name text
- customer_phone text
- customer_email text nullable
- service_type text
- estimated_size text nullable
- deadline date nullable
- pickup_method text check in ('pickup','shipping')
- shipping_address text nullable
- shipping_city text nullable
- customer_notes text nullable
- internal_notes text nullable
- status text
- estimated_price numeric nullable
- final_price numeric nullable
- shipping_cost numeric nullable
- discount numeric default 0
- total_amount numeric nullable
- payment_status text default 'UNPAID'
- invoice_id uuid nullable
- created_at timestamptz
- updated_at timestamptz

## order_files
- id uuid primary key
- order_id uuid references orders(id)
- media_asset_id uuid nullable references media_assets(id)
- file_name text
- file_path text
- bucket_name text
- mime_type text
- file_size bigint
- created_at timestamptz

## invoices
- id uuid primary key
- invoice_number text unique
- order_id uuid references orders(id)
- member_id uuid nullable references profiles(id)
- status text
- subtotal numeric
- design_fee numeric default 0
- layout_fee numeric default 0
- shipping_cost numeric default 0
- discount numeric default 0
- total numeric
- issued_at timestamptz nullable
- paid_at timestamptz nullable
- notes text nullable
- created_at timestamptz
- updated_at timestamptz

## payments
- id uuid primary key
- order_id uuid references orders(id)
- invoice_id uuid references invoices(id)
- provider text
- provider_payment_id text nullable
- payment_link text nullable
- status text
- amount numeric
- payload jsonb nullable
- created_at timestamptz
- updated_at timestamptz

## payment_webhook_logs
- id uuid primary key
- provider text
- event_type text nullable
- payload jsonb
- processed boolean default false
- created_at timestamptz

## services
- id uuid primary key
- title text
- slug text unique
- description text
- cocok_untuk text nullable
- notes text nullable
- base_price numeric nullable
- price_label text nullable
- is_active boolean default true
- sort_order integer
- media_asset_id uuid nullable
- created_at timestamptz
- updated_at timestamptz

## price_list_items
- id uuid primary key
- service_id uuid nullable references services(id)
- title text
- description text nullable
- price_label text
- price numeric nullable
- is_vendor_price boolean default false
- is_active boolean default true
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

## media_assets
- id uuid primary key
- file_name text
- file_path text
- public_url text nullable
- bucket_name text
- mime_type text
- file_size bigint
- alt_text text nullable
- category text nullable
- linked_section text nullable
- uploaded_by uuid nullable references profiles(id)
- created_at timestamptz
- updated_at timestamptz

## landing_page_sections
- id uuid primary key
- section_key text unique
- title text nullable
- subtitle text nullable
- body text nullable
- cta_primary_label text nullable
- cta_primary_url text nullable
- cta_secondary_label text nullable
- cta_secondary_url text nullable
- note text nullable
- media_asset_id uuid nullable references media_assets(id)
- is_active boolean default true
- sort_order integer
- content_json jsonb nullable
- created_at timestamptz
- updated_at timestamptz

## landing_page_faqs
- id uuid primary key
- question text
- answer text
- is_active boolean default true
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

## landing_page_value_cards
- id uuid primary key
- title text
- description text
- media_asset_id uuid nullable
- is_active boolean default true
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

## landing_page_audience_cards
- id uuid primary key
- title text
- description text
- main_message text nullable
- media_asset_id uuid nullable
- is_active boolean default true
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

## landing_page_order_steps
- id uuid primary key
- step_number integer
- title text
- description text
- media_asset_id uuid nullable
- is_active boolean default true
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

## site_settings
- id uuid primary key
- key text unique
- value jsonb
- updated_at timestamptz

## seo_settings
- id uuid primary key
- page_key text unique
- meta_title text
- meta_description text
- og_title text nullable
- og_description text nullable
- og_image_id uuid nullable references media_assets(id)
- canonical_url text nullable
- updated_at timestamptz

## tracking_settings
- id uuid primary key
- google_ads_conversion_id text nullable
- google_ads_conversion_label text nullable
- ga4_measurement_id text nullable
- enable_google_ads boolean default false
- enable_ga4 boolean default false
- test_mode boolean default true
- updated_at timestamptz

## order_status_history
- id uuid primary key
- order_id uuid references orders(id)
- old_status text nullable
- new_status text
- changed_by uuid nullable references profiles(id)
- notes text nullable
- created_at timestamptz

## audit_logs
- id uuid primary key
- actor_id uuid nullable references profiles(id)
- action text
- entity_type text
- entity_id uuid nullable
- metadata jsonb nullable
- created_at timestamptz

---

# 14. AUTH & SECURITY

Implement:
- login member dengan nomor HP + password
- admin login
- role-based access:
  - member
  - admin
  - super_admin

## Rules
- Member hanya bisa melihat order miliknya
- Admin bisa melihat semua order
- Public hanya bisa melihat landing page dan submit order
- Public tidak bisa membaca bucket order-files
- Landing page asset public boleh dibaca publik
- Order files harus private atau protected dengan signed URL untuk admin/member yang berhak
- Payment secret hanya server-side
- Semua input harus divalidasi client-side dan server-side
- Gunakan RLS Supabase
- Jangan expose service role key di frontend
- Buat audit log untuk aksi penting admin:
  - approve order
  - update harga final
  - generate invoice
  - mark payment paid manual
  - delete media
  - update tracking config

---

# 15. UI / UX STYLE DIRECTION

Gunakan style:

**Bold industrial / printing shop**

Karakter UI:
- tegas
- praktis
- modern
- produksi-ready
- B2B-friendly
- mudah dibaca
- tidak terlalu retail fashion
- tidak terlalu playful

## Color system
Gunakan neutral-led industrial palette:
- Background utama: off-white / very light gray
- Text utama: charcoal / near black
- Surface: white
- Surface dark: deep charcoal / near black
- Primary brand: deep blue / industrial navy
- Accent CTA: WhatsApp green untuk CTA WhatsApp
- Accent action/order: orange atau amber industrial untuk Order Cepat
- Border: neutral gray
- Status colors: success, warning, danger, info dengan label teks

Pastikan:
- CTA utama sangat jelas
- satu area hanya punya satu primary action
- jangan terlalu banyak warna jenuh
- kontras teks aman
- status tidak bergantung pada warna saja

## Layout
- Mobile-first
- Hero section harus langsung menjelaskan offer dan CTA
- CTA sticky WhatsApp di mobile
- Section pendek dan mudah discan
- Cards rapi dan responsive
- Admin dashboard compact tapi breathable
- Tables di mobile berubah menjadi card list
- Forms punya helper text dan error state jelas

## Components
Gunakan shadcn/ui untuk:
- Button
- Input
- Textarea
- Select
- Checkbox
- Dialog
- Sheet
- Tabs
- Accordion
- Badge
- Card
- Table
- Dropdown Menu
- Toast
- Alert
- Form

## States wajib
Setiap flow kritikal harus punya:
- loading
- success
- error
- empty
- validation error
- permission denied
- upload progress
- payment pending
- webhook failed fallback

---

# 16. ACCESSIBILITY & PERFORMANCE

## Accessibility
- Semantic HTML
- Label form jelas
- Error message jelas
- Keyboard navigable
- Focus visible
- Button target nyaman di mobile
- Alt text untuk semua gambar publik
- Accordion accessible
- Dialog focus trap
- Contrast aman
- Status dengan teks, bukan warna saja

## Performance
- Optimize image loading
- Lazy load section images
- Reserve image space to avoid CLS
- Avoid heavy unnecessary animation
- Code split admin routes
- Avoid blocking third-party scripts
- Core Web Vitals target:
  - LCP <= 2.5s
  - INP <= 200ms
  - CLS <= 0.1

---

# 17. SEO REQUIREMENTS

Landing page harus SEO-ready.

Implement:
- dynamic meta title from admin
- dynamic meta description from admin
- OG tags
- canonical URL
- schema.org LocalBusiness / Service basic JSON-LD
- structured address
- heading hierarchy proper
- clean semantic sections
- sitemap optional
- robots optional

Keywords focus:
- print DTF meteran
- jasa print DTF
- DTF transfer siap press
- print DTF vendor
- print DTF reseller
- print DTF Cileungsi
- print DTF Bogor
- cetak DTF meteran
- layout DTF hemat area cetak
- cetak banyak desain DTF

---

# 18. TRACKING EVENTS

Buat helper tracking function.

Events:
- `cta_order_cepat_click`
- `cta_whatsapp_click`
- `price_list_click`
- `order_form_start`
- `order_form_submit`
- `file_upload_start`
- `file_upload_success`
- `file_upload_error`
- `admin_order_approved`
- `invoice_generated`
- `payment_link_generated`
- `payment_success`
- `member_login`
- `invoice_download`

Tracking harus respect config dari admin:
- jika GA4 disabled, jangan kirim GA4
- jika Google Ads disabled, jangan kirim Google Ads
- jika test mode, log ke console saja

---

# 19. NETLIFY DEPLOYMENT

Siapkan:
- environment variables documentation
- Netlify build command
- Netlify publish directory
- Netlify Functions jika dipakai
- redirect rules untuk SPA routing
- webhook endpoint untuk payment

## Env variables
Contoh:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`
- `APP_URL`

Jangan commit env secret.

---

# 20. SEED DATA

Buat script atau SQL seed untuk:
- default company profile
- default WhatsApp config
- default SEO
- default landing page sections
- default FAQ
- default services
- default value cards
- default audience cards
- default order steps
- default price list placeholder
- default tracking settings disabled
- default admin user instruction

Landing page harus bisa langsung tampil setelah setup database.

---

# 21. ACCEPTANCE CRITERIA

Aplikasi dianggap selesai jika:

## Landing page
- Tampil baik di mobile dan desktop
- Semua section utama muncul
- CTA Order Cepat bekerja
- CTA WhatsApp membuka pesan pre-filled
- Konten landing page berasal dari Supabase / fallback seed
- Gambar/aset landing page berasal dari Supabase Storage / fallback
- Admin bisa edit teks dan media landing page

## Order
- User bisa submit order cepat
- User bisa upload file
- File masuk Supabase Storage
- Data order masuk database
- Status awal benar
- Halaman sukses order muncul

## Admin
- Admin bisa login
- Admin bisa melihat order
- Admin bisa melihat/download file
- Admin bisa update status
- Admin bisa input harga final
- Admin bisa approve order
- Admin bisa generate invoice
- Admin bisa generate payment link
- Admin bisa edit landing page content
- Admin bisa upload dan mengelola media asset
- Admin bisa edit SEO/tracking/WhatsApp/company config

## Member
- Member bisa login dengan nomor HP + password
- Member bisa melihat riwayat order
- Member bisa melihat detail order
- Member bisa melihat invoice
- Member bisa print/download invoice

## Payment
- Payment link dibuat setelah admin approve
- Payment webhook endpoint tersedia
- Status pembayaran bisa berubah
- Payment secret tidak terekspos ke frontend

## Security
- RLS aktif
- Role-based access berjalan
- Order file tidak public tanpa kontrol
- Admin action penting tercatat di audit log

## UX
- Loading, empty, error states tersedia
- Form validation jelas
- Upload progress jelas
- Mobile-first
- Accessible keyboard/focus states

---

# 22. IMPLEMENTATION INSTRUCTIONS

Kerjakan secara bertahap:

## Phase 1 — Foundation
- Setup React + Vite + TypeScript + Tailwind + shadcn/ui
- Setup Supabase client
- Setup routing
- Setup layout public/admin/member
- Setup design tokens

## Phase 2 — Database & Storage
- Buat migrations
- Buat buckets
- Buat RLS policies
- Buat seed data

## Phase 3 — Landing Page + CMS Read
- Bangun landing page dari Supabase content
- Tambahkan fallback content
- Tambahkan CTA WhatsApp
- Tambahkan SEO dynamic

## Phase 4 — Order Cepat
- Build order form
- Upload file to Supabase Storage
- Save order to database
- Success page

## Phase 5 — Admin Dashboard
- Login admin
- Orders management
- File preview
- Status update
- Price final
- Invoice generation
- Payment link placeholder/provider adapter

## Phase 6 — CMS Admin
- Landing page content editor
- Media library
- SEO/tracking config
- WhatsApp config
- Company profile

## Phase 7 — Member Area
- Login/register member
- Dashboard member
- Order history
- Invoice view/print/download

## Phase 8 — Payment Integration
- Payment adapter
- Midtrans provider implementation
- Serverless webhook
- Payment status update
- Payment logs

## Phase 9 — QA & Polish
- Responsive QA
- Accessibility QA
- Performance optimization
- Error handling
- Empty states
- Security review

---

# 23. OUTPUT YANG HARUS DIBERIKAN OLEH AI CODING AGENT

Setelah implementasi, berikan:
1. Ringkasan fitur yang berhasil dibuat
2. Struktur folder
3. Cara setup Supabase
4. Cara setup Storage buckets
5. Cara setup environment variables
6. Cara menjalankan lokal
7. Cara deploy ke Netlify
8. Cara membuat admin pertama
9. Catatan payment gateway
10. Daftar fitur yang masih mock/placeholder bila ada
11. Testing checklist

Bangun kode dengan kualitas production-minded. Jangan hanya membuat UI dummy. Pastikan data flow, schema, storage, auth, admin, dan CMS konten/media benar-benar siap dikembangkan lebih lanjut.