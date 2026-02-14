# Niga Proxy

Proxy streaming dan subtitle untuk anime. Diadaptasi dari [niganime-proxy](https://github.com/WildanAbdelF/niganime-proxy) untuk deployment di Netlify.

## 🚀 Quick Deploy

### Opsi 1: Netlify CLI (Tercepat)

```bash
# Install Netlify CLI (jika belum)
npm install -g netlify-cli

# Login
netlify login

# Masuk ke folder proxy
cd netlify-proxy

# Deploy production
netlify deploy --prod
```

Setelah deploy, Netlify akan memberikan URL seperti: `https://your-site-name.netlify.app`

### Opsi 2: Deploy via GitHub

1. **Buat repository GitHub baru** (contoh: `anime-proxy`)

2. **Push folder ini ke GitHub:**
```bash
cd netlify-proxy
git init
git add .
git commit -m "Initial proxy setup"
git remote add origin https://github.com/USERNAME/anime-proxy.git
git push -u origin main
```

3. **Deploy di Netlify:**
   - Buka https://app.netlify.com
   - Klik **"Add new site"** → **"Import an existing project"**
   - Pilih repository GitHub Anda
   - Build settings akan otomatis terdeteksi dari `netlify.toml`
   - Klik **"Deploy site"**

### Opsi 3: Netlify Drop (Paling Mudah)

1. Zip folder `netlify-proxy`
2. Buka https://app.netlify.com/drop
3. Drag & drop file ZIP

## ⚙️ Environment Variables

Setelah deploy, set environment variables di Netlify Dashboard:

1. Buka site Anda di Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Tambahkan:

| Variable | Value | Required |
|----------|-------|----------|
| `PUBLIC_PROXY_BASE` | `https://your-site-name.netlify.app` | ✅ Ya |
| `MEGACLOUD_REFERER` | `https://megacloud.blog/` | ❌ Optional |
| `MEGACLOUD_ORIGIN` | `https://megacloud.blog` | ❌ Optional |

**PENTING:** `PUBLIC_PROXY_BASE` harus diisi dengan URL Netlify final Anda!

4. **Redeploy** setelah mengatur environment variables:
   - **Deploys** → **Trigger deploy** → **Deploy site**

## 🔗 Update URL di Main App

Setelah proxy deploy, update URL di aplikasi utama Anda:

1. **Di Vercel Environment Variables:**
   ```
   NEXT_PUBLIC_STREAM_PROXY=https://your-site-name.netlify.app
   ```

2. **Redeploy** aplikasi Vercel Anda

## 📡 Endpoints

- `GET /stream?url={encoded_url}` - Proxy video streams (HLS/M3U8)
- `GET /subtitle?url={encoded_url}` - Proxy subtitles (VTT/SRT)

## 🔍 Testing

Setelah deploy, test endpoint:

```bash
# Test homepage
curl https://your-site-name.netlify.app/

# Test stream endpoint (gunakan URL streaming valid)
curl "https://your-site-name.netlify.app/stream?url=https://example.com/video.m3u8"

# Test subtitle endpoint
curl "https://your-site-name.netlify.app/subtitle?url=https://example.com/subtitle.vtt"
```

## ✨ Features

- ✅ CORS enabled untuk semua origins
- ✅ M3U8 playlist rewriting otomatis
- ✅ Support HLS streaming (m3u8, ts segments)
- ✅ Support subtitle (VTT, SRT)
- ✅ Caching optimal (video segments: 1 tahun, m3u8: no-cache)
- ✅ Spoofing headers (Referer, Origin, User-Agent)

## 📦 Project Structure

```
netlify-proxy/
├── functions/
│   ├── stream.js      # Proxy untuk video streaming
│   └── subtitle.js    # Proxy untuk subtitle
├── public/
│   └── index.html     # Landing page
├── netlify.toml       # Konfigurasi Netlify
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### CORS Error
- Pastikan proxy sudah deploy dengan benar
- Check environment variable `PUBLIC_PROXY_BASE` sudah diset

### Video tidak play
- Check console browser untuk error messages
- Verify URL streaming masih valid
- Test endpoint secara manual dengan curl

### M3U8 URLs tidak ter-rewrite
- Pastikan `PUBLIC_PROXY_BASE` environment variable sudah diset
- Redeploy setelah set environment variables

## 📝 Credits

Diadaptasi dari: [WildanAbdelF/niganime-proxy](https://github.com/WildanAbdelF/niganime-proxy)
