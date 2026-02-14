# 🚀 Panduan Deploy Step-by-Step

## Langkah 1: Deploy Proxy ke Netlify

### Opsi A: Via Netlify CLI (Paling Cepat)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login ke Netlify
netlify login

# 3. Masuk ke folder proxy
cd netlify-proxy

# 4. Deploy production
netlify deploy --prod
```

✅ Setelah deploy berhasil, Netlify akan memberikan URL seperti:  
`https://fancy-name-123abc.netlify.app`

**PENTING: Catat URL ini!**

---

### Opsi B: Via Netlify Dashboard (Paling Mudah)

1. **Buat ZIP file:**
   - Klik kanan folder `netlify-proxy`
   - "Send to" → "Compressed (zipped) folder"

2. **Deploy via Netlify Drop:**
   - Buka browser: https://app.netlify.com/drop
   - Login jika belum
   - Drag & drop file ZIP ke halaman

✅ Netlify akan otomatis deploy. URL akan muncul setelah selesai.

---

## Langkah 2: Set Environment Variables di Netlify

1. **Buka Netlify Dashboard:**
   - Pergi ke https://app.netlify.com
   - Pilih site yang baru saja di-deploy

2. **Masuk ke Settings:**
   - Klik tab **"Site configuration"**
   - Pilih **"Environment variables"**

3. **Tambah Environment Variables:**
   
   Klik **"Add a variable"** dan tambahkan:
   
   | Key | Value |
   |-----|-------|
   | `PUBLIC_PROXY_BASE` | `https://fancy-name-123abc.netlify.app` |
   | `MEGACLOUD_REFERER` | `https://megacloud.blog/` |
   | `MEGACLOUD_ORIGIN` | `https://megacloud.blog` |

   ⚠️ **PENTING:** Ganti `fancy-name-123abc.netlify.app` dengan URL Netlify Anda yang sebenarnya!

4. **Redeploy:**
   - Pergi ke tab **"Deploys"**
   - Klik **"Trigger deploy"** → **"Deploy site"**
   - Tunggu deploy selesai (~30 detik)

---

## Langkah 3: Test Proxy

Buka browser dan test:

```
https://fancy-name-123abc.netlify.app/
```

Jika berhasil, akan muncul landing page dengan status "✅ Service is running"

---

## Langkah 4: Update Main App (Vercel)

1. **Buka Vercel Dashboard:**
   - Pergi ke https://vercel.com/dashboard
   - Pilih project anime app Anda

2. **Set Environment Variable:**
   - **Settings** → **Environment Variables**
   - Klik **"Add New"**
   - Key: `NEXT_PUBLIC_STREAM_PROXY`
   - Value: `https://fancy-name-123abc.netlify.app` (URL proxy Netlify)
   - ✅ Check: Production, Preview, Development (semua)
   - Klik **"Save"**

3. **Redeploy:**
   - Pergi ke tab **"Deployments"**
   - Klik titik tiga di deployment terbaru
   - Pilih **"Redeploy"**
   - Tunggu deploy selesai

---

## Langkah 5: Test Streaming

1. Buka aplikasi anime Anda yang sudah di-deploy di Vercel
2. Pilih anime dan episode
3. Klik play
4. Video seharusnya bisa streaming! 🎉

---

## 🐛 Troubleshooting

### Video tidak play / CORS error
✅ **Solusi:**
- Check console browser (F12) untuk lihat error
- Pastikan environment variable `PUBLIC_PROXY_BASE` di Netlify sudah benar
- Pastikan sudah redeploy setelah set environment variables

### Proxy function error
✅ **Solusi:**
- Buka Netlify Dashboard → Functions → Pilih function → Lihat logs
- Check apakah URL streaming source masih valid

### Environment variable tidak terdeteksi
✅ **Solusi:**
- Pastikan sudah **redeploy** setelah add environment variables
- Variable names harus EXACT seperti di instruksi (case-sensitive)

---

## ✅ Checklist

- [ ] Proxy sudah deploy di Netlify
- [ ] Environment variables sudah diset di Netlify (`PUBLIC_PROXY_BASE`)
- [ ] Netlify sudah di-redeploy setelah set variables
- [ ] `NEXT_PUBLIC_STREAM_PROXY` sudah diset di Vercel
- [ ] Vercel app sudah di-redeploy
- [ ] Test streaming berhasil

---

**Selesai! 🎊** Aplikasi anime streaming Anda sekarang sudah menggunakan proxy Netlify yang proper dengan CORS support.
