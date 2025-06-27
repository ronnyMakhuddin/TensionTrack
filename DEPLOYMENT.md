# Panduan Deployment TensionTrack

## Platform Hosting Gratis yang Direkomendasikan

### 1. Vercel (Rekomendasi Utama) ⭐

**Keunggulan:**
- Dibuat oleh tim Next.js
- Optimasi sempurna untuk Next.js
- 100GB bandwidth/bulan gratis
- Custom domain gratis
- SSL otomatis
- Preview deployments untuk setiap commit

**Cara Deploy:**

#### Langkah 1: Siapkan Repository GitHub
```bash
# Inisialisasi git jika belum
git init
git add .
git commit -m "Initial commit"

# Buat repository di GitHub dan push
git remote add origin https://github.com/username/tensiontrack.git
git push -u origin main
```

#### Langkah 2: Deploy ke Vercel
1. Kunjungi [vercel.com](https://vercel.com)
2. Sign up dengan GitHub account
3. Klik "New Project"
4. Import repository TensionTrack
5. Vercel akan otomatis mendeteksi Next.js
6. Klik "Deploy"

**Hasil:** Aplikasi akan live di `https://tensiontrack-username.vercel.app`

---

### 2. Netlify

**Keunggulan:**
- Interface yang user-friendly
- Build tools yang baik
- 100GB bandwidth/bulan gratis
- Custom domain gratis

**Cara Deploy:**

#### Langkah 1: Build Project
```bash
npm run build
```

#### Langkah 2: Deploy ke Netlify
1. Kunjungi [netlify.com](https://netlify.com)
2. Sign up dengan GitHub
3. Klik "New site from Git"
4. Pilih repository TensionTrack
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Klik "Deploy site"

---

### 3. Railway

**Keunggulan:**
- Full-stack hosting
- Database support
- $5 credit/bulan gratis

**Cara Deploy:**
1. Kunjungi [railway.app](https://railway.app)
2. Sign up dengan GitHub
3. Klik "New Project"
4. Pilih "Deploy from GitHub repo"
5. Pilih repository TensionTrack
6. Railway akan otomatis deploy

---

### 4. Render

**Keunggulan:**
- Reliable dan performant
- 750 jam/bulan gratis
- Custom domain

**Cara Deploy:**
1. Kunjungi [render.com](https://render.com)
2. Sign up dengan GitHub
3. Klik "New Web Service"
4. Connect repository TensionTrack
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Klik "Create Web Service"

---

## Persiapan Sebelum Deploy

### 1. Periksa Dependencies
```bash
npm install
npm run build
```

### 2. Test Build Lokal
```bash
npm run build
npm start
```

### 3. Periksa Environment Variables
Pastikan semua environment variables yang diperlukan sudah diset di platform hosting.

### 4. Optimasi Gambar
Pastikan semua gambar sudah dioptimasi untuk web.

---

## Troubleshooting

### Error Build
- Periksa console log untuk error
- Pastikan semua dependencies terinstall
- Periksa TypeScript errors dengan `npm run typecheck`

### Error Runtime
- Periksa environment variables
- Periksa Firebase configuration
- Periksa network requests

### Performance Issues
- Optimasi gambar
- Implementasi lazy loading
- Periksa bundle size

---

## Monitoring & Analytics

### Vercel Analytics
- Gratis dengan Vercel
- Real-time performance monitoring
- Error tracking

### Google Analytics
- Tambahkan Google Analytics untuk tracking user behavior

---

## Custom Domain

### Vercel
1. Buka project di Vercel dashboard
2. Klik "Settings" > "Domains"
3. Tambahkan custom domain
4. Update DNS records

### Netlify
1. Buka site di Netlify dashboard
2. Klik "Domain settings"
3. Tambahkan custom domain
4. Update DNS records

---

## Backup & Version Control

### Git Best Practices
```bash
# Buat branch untuk fitur baru
git checkout -b feature/new-feature

# Commit secara regular
git add .
git commit -m "Add new feature"

# Push ke remote
git push origin feature/new-feature

# Merge ke main setelah testing
git checkout main
git merge feature/new-feature
```

---

## Maintenance

### Regular Updates
- Update dependencies secara regular
- Monitor security vulnerabilities
- Backup data secara regular

### Performance Monitoring
- Monitor Core Web Vitals
- Optimasi berdasarkan user feedback
- Regular performance audits 