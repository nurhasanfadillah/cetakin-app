import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, FileText, Loader2, ArrowLeft, MessageCircle, Check, User, FileImage, MapPin, Truck, StickyNote, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nama minimal 2 karakter'),
  customer_phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  customer_email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  service_type: z.enum(['print_dtf_meteran', 'print_banyak_desain', 'maklon_vendor', 'bantuan_layout', 'bantu_desain']),
  estimated_size: z.string().optional(),
  deadline: z.string().optional(),
  pickup_method: z.enum(['pickup', 'shipping']),
  shipping_address: z.string().optional(),
  shipping_city: z.string().optional(),
  customer_notes: z.string().optional(),
  create_account: z.boolean().optional(),
  password: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

const SERVICE_OPTIONS = [
  { value: 'print_dtf_meteran', label: 'Print DTF Meteran' },
  { value: 'print_banyak_desain', label: 'Print Banyak Desain Sekaligus' },
  { value: 'maklon_vendor', label: 'Maklon Print DTF Vendor' },
  { value: 'bantuan_layout', label: 'Bantuan Layout Hemat Area Cetak' },
  { value: 'bantu_desain', label: 'Bantu Desain Ringan' },
]

export default function OrderPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pickup_method: 'pickup',
      service_type: 'print_dtf_meteran',
      create_account: false,
    },
  })

  const pickupMethod = watch('pickup_method')
  const createAccount = watch('create_account')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${year}${month}-${random}`
  }

  const onSubmit = async (data: OrderFormData) => {
    try {
      setUploading(true)
      setUploadProgress(10)

      const orderNumber = generateOrderNumber()
      let orderData: Record<string, unknown> = {
        order_number: orderNumber,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        service_type: data.service_type,
        estimated_size: data.estimated_size || null,
        deadline: data.deadline || null,
        pickup_method: data.pickup_method,
        shipping_address: data.shipping_address || null,
        shipping_city: data.shipping_city || null,
        customer_notes: data.customer_notes || null,
        status: 'MENUNGGU_REVIEW_FILE',
        payment_status: 'UNPAID',
        discount: 0,
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      if (files.length > 0) {
        setUploadProgress(30)
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const filePath = `order-files/customer-uploads/${orderNumber}/${file.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('order-files')
            .upload(filePath, file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }

          await supabase.from('order_files').insert({
            order_id: order.id,
            file_name: file.name,
            file_path: filePath,
            bucket_name: 'order-files',
            mime_type: file.type,
            file_size: file.size,
          })

          setUploadProgress(30 + ((i + 1) / files.length) * 60)
        }
      }

      setUploadProgress(100)
      navigate(`/order/success/${orderNumber}`)
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const openWhatsApp = () => {
    const msg = `Halo, saya ingin print DTF transfer siap press.

Kebutuhan saya:
- Jenis order: ${SERVICE_OPTIONS.find(o => o.value === watch('service_type'))?.label}
- Ukuran desain: ${watch('estimated_size') || '-'}
- Deadline: ${watch('deadline') || '-'}
- Kota pengiriman: ${watch('shipping_city') || '-'}

Mohon dilengkapi cek file dan estimasi harganya.`
    const waUrl = `https://wa.me/6282113133165?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Order Cepat</h1>
              <p className="text-sm text-muted-foreground">Print DTF Transfer Siap Press</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
          {/* Customer Info */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Informasi Customer</h2>
                <p className="text-sm text-muted-foreground">Siapa yang harus kami hubungi?</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Lengkap *</label>
                <input
                  {...register('customer_name')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Nama lengkap Anda"
                />
                {errors.customer_name && (
                  <p className="text-sm text-danger mt-1">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nomor WhatsApp *</label>
                <input
                  {...register('customer_phone')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="08xxxxxxxxxx"
                />
                {errors.customer_phone && (
                  <p className="text-sm text-danger mt-1">{errors.customer_phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email (opsional)</label>
                <input
                  {...register('customer_email')}
                  type="email"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="email@example.com"
                />
                {errors.customer_email && (
                  <p className="text-sm text-danger mt-1">{errors.customer_email.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Order Details */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileImage className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Detail Order</h2>
                <p className="text-sm text-muted-foreground">Pilih layanan yang dibutuhkan</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Jenis Layanan *</label>
                <select
                  {...register('service_type')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Estimasi Ukuran/Panjang</label>
                <input
                  {...register('estimated_size')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Contoh: 30cm x 40cm atau 1 meter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Deadline</label>
                <input
                  {...register('deadline')}
                  type="date"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Pickup Method */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pengambilan</h2>
                <p className="text-sm text-muted-foreground">Bagaimana cara拿到 hasil cetak?</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label 
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  pickupMethod === 'pickup' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  {...register('pickup_method')}
                  type="radio"
                  value="pickup"
                  className="sr-only"
                />
                <MapPin className={`w-5 h-5 ${pickupMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <span className="font-medium">Ambil di Workshop</span>
                  <p className="text-xs text-muted-foreground">Cileungsi, Bogor</p>
                </div>
                {pickupMethod === 'pickup' && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </label>
              
              <label 
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  pickupMethod === 'shipping' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  {...register('pickup_method')}
                  type="radio"
                  value="shipping"
                  className="sr-only"
                />
                <Truck className={`w-5 h-5 ${pickupMethod === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <span className="font-medium">Kirim Ekspedisi</span>
                  <p className="text-xs text-muted-foreground">Ke alamat tujuan</p>
                </div>
                {pickupMethod === 'shipping' && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </label>
            </div>

            {pickupMethod === 'shipping' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Alamat Pengiriman</label>
                  <textarea
                    {...register('shipping_address')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="Alamat lengkap termasuk RT/RW"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kota Pengiriman</label>
                  <input
                    {...register('shipping_city')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="Nama kota"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Catatan</h2>
                <p className="text-sm text-muted-foreground">Informasi tambahan (opsional)</p>
              </div>
            </div>
            <textarea
              {...register('customer_notes')}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="Catatan khusus untuk order..."
              rows={4}
            />
          </section>

          {/* File Upload */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileImage className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Upload File Desain</h2>
                <p className="text-sm text-muted-foreground">PNG, JPG, PDF, AI, CDR, PSD, ZIP</p>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">
                Klik untuk upload atau drag & drop file desain
              </p>
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf,.ai,.cdr,.psd,.zip"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  Pilih File
                </Button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Create Account */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                {...register('create_account')}
                type="checkbox"
                className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">Buat akun untuk cek status & riwayat pesanan</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Centang jika ingin membuat akun member
                </p>
              </div>
            </label>

            {createAccount && (
              <div className="mt-4 pl-9 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex flex-col gap-4">
            <Button type="submit" variant="accent" size="lg" disabled={isSubmitting || uploading} className="group">
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Mengirim... {uploadProgress}%
                </>
              ) : (
                <>
                  Kirim Order
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <Button type="button" variant="whatsapp" size="lg" onClick={openWhatsApp}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Atau chat via WhatsApp
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}