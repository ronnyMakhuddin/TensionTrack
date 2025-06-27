# 🩺 TensionTrack - Smart Hypertension Management

Aplikasi web modern dan pintar untuk manajemen hipertensi dengan AI-powered advice, tracking komprehensif, dan konsultasi Ners Counselor. Pantau tekanan darah, aktivitas, tidur, latihan, dan diet dengan analisis tren kesehatan real-time.

## ✨ Fitur Utama

### 📊 **Health Tracking Komprehensif**
- **Tekanan Darah** - Tracking harian dengan klasifikasi otomatis
- **Aktivitas Fisik** - Support berbagai aktivitas termasuk kebiasaan tidak sehat
- **Pola Tidur** - Monitoring durasi dan kualitas tidur
- **Latihan Fisik** - Tracking latihan dengan kondisi fisik
- **Diet & Nutrisi** - Log makanan dan resep sehat
- **Profil Pasien** - Data lengkap untuk konsultasi

### 🤖 **AI-Powered Features**
- **Personalized Advice** - Saran personal berdasarkan data kesehatan
- **Behavior Change Plan** - Plan perubahan perilaku 30 hari
- **Activity Assessment** - Analisis dampak aktivitas terhadap kesehatan
- **Sleep Optimization** - Rekomendasi perbaikan pola tidur
- **Diet Feedback** - Saran nutrisi untuk hipertensi

### 📈 **Analytics & Reports**
- **Health Score** - Skor kesehatan komprehensif (0-100%)
- **Trend Analysis** - Grafik garis tren kesehatan real-time
- **Nurse Report** - Laporan lengkap untuk Ners Counselor
- **PDF Export** - Export laporan kesehatan
- **WhatsApp Integration** - Sharing laporan via WhatsApp

### 🏥 **Healthcare Integration**
- **Ners Counselor Consultation** - Konsultasi via WhatsApp
- **Medical Profile** - Data medis lengkap pasien
- **Medication Reminders** - Pengingat obat yang fleksibel
- **Emergency Contacts** - Kontak darurat

### 🎯 **User Experience**
- **Responsive Design** - Optimal di desktop dan mobile
- **Real-time Updates** - Data sinkron real-time
- **Interactive Charts** - Visualisasi data yang informatif
- **Intuitive UI** - Interface yang mudah digunakan

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
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (Genkit) - untuk fitur AI
GOOGLE_AI_API_KEY=your_google_ai_key
```

## 📁 Struktur Project

```
src/
├── app/                 # Next.js App Router
│   ├── (app)/          # Protected routes
│   │   ├── activity/   # Activity tracking
│   │   ├── advice/     # AI advice
│   │   ├── consultation/ # Nurse consultation
│   │   ├── diet/       # Diet management
│   │   ├── education/  # Health education
│   │   ├── exercises/  # Exercise tracking
│   │   ├── profile/    # Patient profile
│   │   ├── recipes/    # Healthy recipes
│   │   ├── relaxation/ # Relaxation techniques
│   │   ├── reminders/  # Medication reminders
│   │   ├── sleep/      # Sleep tracking
│   │   └── trends/     # Health analytics
│   ├── (auth)/         # Auth pages
│   └── api/            # API routes
├── components/          # Reusable components
├── lib/                # Utilities & config
├── hooks/              # Custom hooks
└── ai/                 # AI flows & prompts
    └── flows/          # AI behavior flows
```

## 🎨 Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google AI (Genkit) + Gemini Pro
- **Charts**: Recharts (Line Charts, Pie Charts)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks + Context

## 📱 Screenshots

- Dashboard dengan health score dan trend analysis
- AI-powered behavior change plan
- Comprehensive health tracking
- Nurse consultation interface
- Real-time health analytics
- Patient profile management

## 🆕 Fitur Terbaru

### v1.0.0 - Smart Hypertension Management
- ✅ AI-powered personalized advice
- ✅ Comprehensive health tracking
- ✅ Real-time trend analysis
- ✅ Nurse consultation integration
- ✅ Behavior change planning
- ✅ Patient profile management
- ✅ PDF health reports
- ✅ WhatsApp integration

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
