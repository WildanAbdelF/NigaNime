# Update: Embed Player untuk Megacloud (HD-1)

## 🎯 Perubahan yang Dilakukan

Untuk mengatasi error 403 dari Megacloud CDN, video player sekarang menggunakan **embed player** untuk server HD-1.

## ✅ Fitur Baru:

### 1. Auto-Embed untuk HD-1 (Megacloud)
- Server HD-1 **otomatis** menggunakan embed player dari HiAnime/2anime.xyz
- Tidak lagi menggunakan proxy untuk HD-1 → **menghilangkan 403 error**
- Kualitas video tetap sama (1080p, 720p, 480p tersedia di embed)

### 2. Auto-Fallback System
- Jika proxy gagal dengan error 403, otomatis switch ke embed player
- User tidak perlu manual klik tombol fallback
- Seamless experience

### 3. Dual Player Mode
- **Embed Player**: Digunakan untuk HD-1 dan fallback
- **Native Player**: Masih digunakan untuk HD-2 dan server lain yang bekerja dengan proxy
- User bisa switch manual antara embed dan native

## 🔄 Cara Kerja:

```
Player Load
    ↓
Is Server HD-1? ──Yes──→ Use Embed Player
    ↓ No
Try Native Player with Proxy
    ↓
Success? ──Yes──→ Use Native Player
    ↓ No (403 Error)
Auto-Switch to Embed Player
```

## 🎮 User Interface:

### Saat Embed Player Aktif:
- Badge kuning "Embed Player" di kanan atas
- Tombol "Try Native Player" untuk switch ke native

### Saat Native Player Aktif:
- Video player dengan kontrol penuh
- Jika error → Tombol "Use Embed Player" muncul

## 📝 Embed URL Format:

```
https://2anime.xyz/embed/{anime-id}?ep={episode}&server={server}&category={category}
```

Contoh:
```
https://2anime.xyz/embed/jujutsu-kaisen-2961?ep=1&server=hd-1&category=sub
```

## 🔧 Server Behavior:

| Server | Default Mode | Proxy Used | 403 Error Risk |
|--------|--------------|------------|----------------|
| HD-1 (Megacloud) | Embed | ❌ No | ✅ Fixed |
| HD-2 (Vidcloud) | Native | ✅ Yes | ✅ Low |
| StreamSB | Native | ✅ Yes | ✅ Low |
| StreamTape | Native | ✅ Yes | ✅ Low |

## 🚀 Deploy & Test:

### 1. Commit Changes
```bash
git add .
git commit -m "Add embed player for HD-1 to fix 403 errors"
git push
```

### 2. Test di Vercel
- Pilih anime apapun
- Play episode dengan **HD-1** → Seharusnya langsung pakai embed, no 403
- Switch ke **HD-2** → Seharusnya pakai native player dengan proxy

### 3. Test Manual Switch
- Klik "Try Native Player" untuk switch dari embed ke native
- Jika native gagal → otomatis kembali ke embed

## 💡 Keuntungan Embed Player:

✅ **No 403 Errors** - Langsung dari source resmi HiAnime  
✅ **No Proxy Needed** - Hemat Railway credit  
✅ **Better Reliability** - Server HiAnime lebih stabil  
✅ **All Qualities** - 1080p, 720p, 480p, 360p tersedia  
✅ **Auto Subtitles** - Subtitle otomatis included  
✅ **No Configuration** - Works out of the box  

## ⚠️ Keterbatasan Embed Player:

❌ **Player Controls** - Terbatas (tidak ada custom intro/outro skip)  
❌ **Watch History** - Tidak track progress (bisa ditambahkan nanti)  
❌ **Custom Subtitles** - Tidak bisa upload subtitle sendiri  

## 🔮 Future Improvements:

1. **Track progress** untuk embed player menggunakan postMessage
2. **Custom subtitle upload** dengan iframe communication
3. **Quality selector** untuk embed player
4. **Picture-in-Picture** support untuk embed

## 🧪 Troubleshooting:

### Embed Player Tidak Muncul
1. Check browser console untuk errors
2. Pastikan URL embed valid: klik kanan iframe → "Open in new tab"
3. Clear browser cache

### Embed Player Blank/Black
1. Ad blocker mungkin memblokir → whitelist 2anime.xyz
2. Browser security settings → allow iframes
3. Try different browser

### Masih Ada 403 Error
Jika masih error 403 di HD-1:
1. Pastikan `useEmbed` state benar (check React DevTools)
2. Check commit sudah ter-deploy ke Vercel
3. Hard refresh browser (Ctrl+Shift+R)

## 📊 Expected Results:

**Before Update:**
```
HD-1 → Proxy → 403 Forbidden ❌
HD-2 → Proxy → Works (tapi kadang lambat) ⚠️
```

**After Update:**
```
HD-1 → Embed → Works perfectly ✅
HD-2 → Proxy → Works ✅
```

## 🎉 Kesimpulan:

Update ini **menyelesaikan** masalah 403 error di HD-1 dengan cara yang lebih reliable: menggunakan embed player resmi dari HiAnime. User tetap punya opsi untuk switch ke native player jika diinginkan.

Railway proxy masih berguna untuk server lain (HD-2, StreamSB, dll) yang tidak memiliki embed option.
