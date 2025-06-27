# 🩺 TensionTrack - Aplikasi Manajemen Hipertensi

Aplikasi web modern untuk membantu penderita hipertensi mengelola kondisi mereka dengan fitur tracking tekanan darah, edukasi, dan saran personalisasi.

## ✨ Fitur Utama

- 📊 **Tracking Tekanan Darah** - Catat dan monitor tekanan darah harian
- 🍎 **Manajemen Diet** - Log makanan dan resep sehat
- 🏃‍♂️ **Aktivitas Fisik** - Video latihan dan tracking aktivitas
- 🧘‍♀️ **Relaksasi** - Audio meditasi dan teknik relaksasi
- 📚 **Edukasi** - Materi pembelajaran dan kuis interaktif
- 💊 **Reminder Obat** - Pengingat jadwal minum obat
- 🤖 **AI Advice** - Saran personalisasi berbasis AI
- 📱 **Responsive Design** - Optimal di desktop dan mobile

## 🚀 Deployment Cepat

### Vercel (Rekomendasi)
```bash
# 1. Upload ke GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/tensiontrack.git
git push -u origin main

# 2. Deploy ke Vercel
# Kunjungi vercel.com → New Project → Import Repository → Deploy
```

### Platform Lain
- **Netlify**: [netlify.com](https://netlify.com)
- **Railway**: [railway.app](https://railway.app)  
- **Render**: [render.com](https://render.com)

📖 **Panduan lengkap**: Lihat [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm atau yarn

### Install & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Buat file `.env.local`:
```env
# Firebase Config (opsional untuk demo)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## 📁 Struktur Project

```
src/
├── app/                 # Next.js App Router
│   ├── (app)/          # Protected routes
│   └── (auth)/         # Auth pages
├── components/          # Reusable components
├── lib/                # Utilities & config
├── hooks/              # Custom hooks
└── ai/                 # AI flows & prompts
```

## 🎨 Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google AI (Genkit)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📱 Screenshots

- Dashboard dengan tracking tekanan darah
- Menu edukasi dengan kuis interaktif
- Resep sehat dengan gambar
- Video latihan fisik
- Audio relaksasi

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- 📧 Email: support@tensiontrack.com
- 🐛 Issues: [GitHub Issues](https://github.com/username/tensiontrack/issues)
- 📖 Docs: [Documentation](./docs/)

---

**Made with ❤️ for better health management**
