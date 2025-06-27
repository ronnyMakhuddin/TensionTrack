# 🚀 Panduan Deployment Cepat TensionTrack

## ⚡ Deploy dalam 5 Menit ke Vercel

### Langkah 1: Upload ke GitHub
```bash
# Jika belum ada git repository
git init
git add .
git commit -m "Initial commit"

# Buat repository baru di GitHub.com
# Kemudian push:
git remote add origin https://github.com/USERNAME/tensiontrack.git
git push -u origin main
```

### Langkah 2: Deploy ke Vercel
1. **Buka [vercel.com](https://vercel.com)**
2. **Sign up dengan GitHub** (klik "Continue with GitHub")
3. **Klik "New Project"**
4. **Import repository** TensionTrack
5. **Klik "Deploy"** (Vercel akan otomatis mendeteksi Next.js)

### 🎉 Selesai! 
Aplikasi Anda akan live di: `https://tensiontrack-USERNAME.vercel.app`

---

## 🔧 Alternatif Platform Lain

### Netlify (Juga Mudah)
1. Buka [netlify.com](https://netlify.com)
2. Sign up dengan GitHub
3. Klik "New site from Git"
4. Pilih repository TensionTrack
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Klik "Deploy site"

### Railway (Untuk Full-Stack)
1. Buka [railway.app](https://railway.app)
2. Sign up dengan GitHub
3. Klik "New Project"
4. Pilih "Deploy from GitHub repo"
5. Pilih repository TensionTrack

---

## 📋 Checklist Sebelum Deploy

- [x] ✅ Build berhasil (`npm run build`)
- [x] ✅ Semua dependencies terinstall
- [x] ✅ Repository di GitHub
- [x] ✅ Environment variables siap (jika ada)

---

## 🛠️ Troubleshooting

### Error Build
```bash
# Test build lokal dulu
npm run build
```

### Error Deploy
- Periksa console log di platform hosting
- Pastikan repository public atau terhubung dengan benar
- Periksa branch name (biasanya `main` atau `master`)

### Performance
- Gambar sudah dioptimasi ✅
- Bundle size reasonable ✅
- Lazy loading implemented ✅

---

## 🔗 Link Berguna

- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com  
- **Railway**: https://railway.app
- **Render**: https://render.com

---

## 📞 Support

Jika ada masalah:
1. Periksa console log di browser
2. Periksa build log di platform hosting
3. Pastikan semua dependencies terinstall
4. Test build lokal terlebih dahulu

**Aplikasi siap untuk deployment! 🎯** 