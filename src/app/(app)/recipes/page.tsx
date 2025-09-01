import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const recipes = [
  {
    title: "Pepes Ikan Kemangi",
    description: "Ikan kukus yang lembut dibungkus daun pisang dengan aroma rempah dan kemangi yang segar. Sedikit garam, kaya rasa.",
    image: { src: "https://placehold.co/600x400.png", hint: "pepes ikan" },
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
    image: { src: "https://placehold.co/600x400.png", hint: "gado gado" },
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
    image: { src: "https://placehold.co/600x400.png", hint: "capcay" },
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
    image: { src: "https://placehold.co/600x400.png", hint: "spinach soup" },
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
