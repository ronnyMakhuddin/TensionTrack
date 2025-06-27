import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const recipes = [
  {
    title: "Pepes Ikan Kemangi",
    description: "Ikan kukus yang lembut dibungkus daun pisang dengan aroma rempah dan kemangi yang segar. Sedikit garam, kaya rasa.",
    image: { 
      src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop", 
      hint: "pepes ikan kemangi" 
    },
    ingredients: [
      "2 ekor ikan kembung atau nila, bersihkan",
      "1 ikat daun kemangi, petiki daunnya",
      "Daun pisang untuk membungkus",
      "Bumbu halus: 5 siung bawang merah, 3 siung bawang putih, 2 butir kemiri, 1 ruas kunyit, sedikit garam",
      "2 batang serai, memarkan",
      "4 lembar daun salam",
      "2 buah tomat, iris",
    ],
    instructions: [
      "Lumuri ikan dengan bumbu halus hingga rata.",
      "Siapkan daun pisang, letakkan daun salam, serai, dan sebagian kemangi.",
      "Letakkan ikan di atasnya, tambahkan irisan tomat dan sisa kemangi.",
      "Bungkus rapat dan sematkan dengan lidi.",
      "Kukus selama 20-30 menit hingga matang.",
      "Bakar sebentar di atas teflon sebelum disajikan untuk aroma yang lebih wangi.",
    ],
  },
  {
    title: "Gado-Gado Rendah Garam",
    description: "Salad sayuran khas Indonesia dengan saus kacang yang gurih dan lebih sehat. Penuh serat dan nutrisi.",
    image: { 
      src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&crop=center", 
      hint: "gado gado salad" 
    },
    ingredients: [
      "Sayuran rebus: kangkung, tauge, kacang panjang, kentang, tahu, tempe",
      "Lontong atau nasi secukupnya",
      "Telur rebus, belah dua",
      "Saus kacang: 150gr kacang tanah goreng, 2 siung bawang putih, 1 buah cabai (opsional), 1 sdm gula merah, sedikit garam, 300ml air hangat, perasan jeruk limau",
    ],
    instructions: [
      "Haluskan semua bahan saus kacang, kecuali air dan jeruk limau. Anda bisa menggunakan blender.",
      "Tambahkan air hangat sedikit demi sedikit sambil diaduk hingga mencapai kekentalan yang diinginkan.",
      "Tambahkan perasan jeruk limau, aduk rata dan koreksi rasa.",
      "Tata sayuran, lontong, dan telur di atas piring.",
      "Siram dengan saus kacang. Sajikan dengan kerupuk rendah garam (opsional).",
    ],
  },
  {
    title: "Capcay Kuah Sederhana",
    description: "Tumis aneka sayuran dengan kuah bening yang lezat dan bergizi. Cepat dan mudah dibuat.",
    image: { 
      src: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop&crop=center", 
      hint: "capcay sayuran" 
    },
    ingredients: [
      "1 buah wortel, iris serong",
      "5 lembar sawi putih, potong-potong",
      "1 bonggol brokoli, potong per kuntum",
      "5 buah bakso ikan/ayam, iris",
      "2 siung bawang putih, cincang",
      "1/2 bawang bombay, iris",
      "1 sdm saus tiram rendah sodium",
      "Sedikit merica dan garam (jika perlu)",
      "200 ml air + 1 sdt maizena untuk mengentalkan",
    ],
    instructions: [
      "Tumis bawang putih dan bawang bombay hingga harum.",
      "Masukkan wortel dan bakso, masak hingga setengah matang.",
      "Tambahkan brokoli dan sawi putih, aduk sebentar.",
      "Tuangkan saus tiram, merica, dan sedikit garam. Aduk rata.",
      "Masukkan larutan air maizena, masak hingga kuah mengental dan sayuran matang.",
    ],
  },
    {
    title: "Sayur Bening Bayam & Jagung",
    description: "Sup sayuran yang ringan dan menyegarkan, cocok untuk menjaga tekanan darah. Pilihan sehat untuk keluarga.",
    image: { 
      src: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop&crop=center", 
      hint: "sup bayam jagung" 
    },
    ingredients: [
      "1 ikat bayam, siangi",
      "1 buah jagung manis, potong-potong",
      "2 siung bawang merah, iris tipis",
      "1 ruas temu kunci, geprek (jika suka)",
      "1 liter air",
      "Gula dan garam secukupnya (gunakan sedikit garam)",
    ],
    instructions: [
        "Didihkan air dalam panci.",
        "Masukkan irisan bawang merah, temu kunci, dan jagung. Masak hingga jagung empuk.",
        "Tambahkan gula dan sedikit garam. Aduk rata.",
        "Masukkan bayam, masak sebentar sekitar 1-2 menit hingga bayam layu. Jangan terlalu lama agar vitaminnya tidak hilang.",
        "Angkat dan sajikan selagi hangat.",
    ],
  },
  {
    title: "Smoothie Buah Beri & Pisang",
    description: "Minuman sehat kaya antioksidan dan kalium yang baik untuk jantung. Tanpa gula tambahan, manis alami dari buah.",
    image: { 
      src: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop&crop=center", 
      hint: "smoothie buah beri" 
    },
    ingredients: [
      "1 buah pisang matang, potong-potong dan bekukan",
      "1/2 cup stroberi segar atau beku",
      "1/2 cup blueberry segar atau beku",
      "1/2 cup yogurt Greek tanpa lemak",
      "1/4 cup susu almond tanpa gula",
      "1 sdm biji chia (opsional)",
      "Es batu secukupnya",
    ],
    instructions: [
      "Masukkan semua bahan ke dalam blender.",
      "Blend hingga halus dan creamy.",
      "Jika terlalu kental, tambahkan sedikit susu almond.",
      "Sajikan segera untuk mendapatkan nutrisi maksimal.",
    ],
  },
  {
    title: "Oatmeal dengan Apel & Kayu Manis",
    description: "Sarapan sehat dengan serat tinggi dan rendah sodium. Mengandung beta-glucan yang baik untuk jantung.",
    image: { 
      src: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&h=400&fit=crop&crop=center", 
      hint: "oatmeal apel kayu manis" 
    },
    ingredients: [
      "1/2 cup oatmeal rolled oats",
      "1 cup air atau susu rendah lemak",
      "1 buah apel, potong dadu kecil",
      "1/2 sdt kayu manis bubuk",
      "1 sdm madu (opsional)",
      "2 sdm kacang almond, cincang kasar",
      "Sedikit garam (opsional, gunakan sedikit sekali)",
    ],
    instructions: [
      "Masak oatmeal dengan air/susu hingga mendidih, aduk terus.",
      "Kecilkan api dan masak selama 5 menit hingga creamy.",
      "Tambahkan apel, kayu manis, dan madu. Aduk rata.",
      "Sajikan dengan taburan kacang almond di atasnya.",
    ],
  },
  {
    title: "Salad Quinoa & Sayuran",
    description: "Salad protein tinggi dengan quinoa sebagai pengganti nasi. Kaya serat dan nutrisi untuk kesehatan jantung.",
    image: { 
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&crop=center", 
      hint: "salad quinoa sayuran" 
    },
    ingredients: [
      "1/2 cup quinoa, cuci bersih",
      "1 cup air",
      "1 buah mentimun, potong dadu",
      "1 buah tomat, potong dadu",
      "1/4 cup jagung manis",
      "1/4 cup kacang merah, tiriskan",
      "2 sdm minyak zaitun extra virgin",
      "1 sdm perasan jeruk lemon",
      "Sedikit garam dan merica",
      "Daun kemangi segar untuk garnish",
    ],
    instructions: [
      "Masak quinoa dengan air hingga matang dan air terserap habis.",
      "Dinginkan quinoa dalam kulkas selama 30 menit.",
      "Campur semua sayuran dengan quinoa yang sudah dingin.",
      "Buat dressing dengan mencampur minyak zaitun, lemon, garam, dan merica.",
      "Tuangkan dressing ke atas salad dan aduk rata.",
      "Garnish dengan daun kemangi sebelum disajikan.",
    ],
  },
  {
    title: "Ikan Salmon Panggang dengan Sayuran",
    description: "Ikan salmon kaya omega-3 yang dipanggang dengan sayuran segar. Menu utama yang sempurna untuk kesehatan jantung.",
    image: { 
      src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&crop=center", 
      hint: "salmon panggang sayuran" 
    },
    ingredients: [
      "2 fillet salmon (150gr per fillet)",
      "1 buah zucchini, iris tipis",
      "1 buah wortel, iris tipis",
      "1/2 buah paprika merah, iris tipis",
      "2 sdm minyak zaitun extra virgin",
      "1 sdt bumbu herbal (rosemary, thyme, atau oregano)",
      "Sedikit garam dan merica",
      "1 buah lemon, iris tipis",
      "2 siung bawang putih, cincang halus",
    ],
    instructions: [
      "Panaskan oven ke 200°C.",
      "Siapkan loyang, alasi dengan kertas baking.",
      "Tata sayuran di loyang, beri minyak zaitun, bawang putih, garam, dan merica.",
      "Letakkan salmon di atas sayuran, beri bumbu herbal, irisan lemon, dan sedikit minyak zaitun.",
      "Panggang selama 15-20 menit hingga salmon matang dan sayuran empuk.",
      "Sajikan dengan irisan lemon segar.",
    ],
  },
];

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resep Sehat untuk Jantung"
        description="Temukan ide makanan lezat yang baik untuk tekanan darah Anda."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {recipes.map((recipe) => (
          <Card key={recipe.title}>
            <CardHeader>
              <div className="aspect-video relative overflow-hidden rounded-lg border mb-4">
                 <Image
                    src={recipe.image.src}
                    alt={`Gambar ${recipe.title}`}
                    fill
                    className="object-cover"
                    data-ai-hint={recipe.image.hint}
                  />
              </div>
              <CardTitle>{recipe.title}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Bahan-bahan</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {recipe.ingredients.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
               <div>
                <h3 className="font-semibold mb-2">Instruksi</h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  {recipe.instructions.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
