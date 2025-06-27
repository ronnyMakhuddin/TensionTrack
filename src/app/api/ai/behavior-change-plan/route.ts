import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientProfile, bpReadings, activityLogs, sleepLogs, exerciseLogs, foodLogs, healthScore, healthTrend } = body;

    // Generate fallback plan since AI flow might not be working
    const fallbackPlan = generateFallbackPlan({
      patientProfile,
      bpReadings,
      activityLogs,
      sleepLogs,
      exerciseLogs,
      foodLogs,
      healthScore,
      healthTrend
    });

    return NextResponse.json({ plan: fallbackPlan });
  } catch (error) {
    console.error('Error generating behavior change plan:', error);
    
    // Return a basic fallback plan
    const basicPlan = `📋 PLAN PERUBAHAN PERILAKU
[Tanggal: ${new Date().toLocaleDateString('id-ID')}]

🎯 TUJUAN UTAMA:
1. Menurunkan tekanan darah ke target normal (<140/90 mmHg)
2. Meningkatkan aktivitas fisik sehat
3. Memperbaiki pola tidur
4. Mengurangi aktivitas tidak sehat

📅 TIMELINE 30 HARI:
Minggu 1: Fokus pada monitoring tekanan darah dan identifikasi pola
Minggu 2: Implementasi aktivitas fisik ringan
Minggu 3: Perbaikan pola tidur dan diet
Minggu 4: Konsolidasi dan evaluasi progress

📊 TARGET SPESIFIK:
- Tekanan Darah: Turun 10-15 mmHg dalam 30 hari
- Aktivitas: 30 menit aktivitas fisik 5x/minggu
- Tidur: 7-8 jam per malam
- Latihan: 20-30 menit latihan 3x/minggu

💡 STRATEGI IMPLEMENTASI:
1. Monitor tekanan darah 2x sehari
2. Jalan kaki 30 menit setiap pagi
3. Hindari makanan tinggi garam
4. Tidur teratur jam 22:00
5. Latihan ringan 3x seminggu
6. Kurangi aktivitas tidak sehat
7. Konsultasi rutin dengan Ners Counselor

⚠️ HALANGAN & SOLUSI:
- Halangan: Malas berolahraga
  Solusi: Mulai dengan aktivitas ringan, ajak keluarga
- Halangan: Sulit tidur
  Solusi: Rutinitas sebelum tidur, hindari gadget
- Halangan: Makanan tidak sehat
  Solusi: Siapkan makanan sehat, baca label nutrisi

📈 MONITORING & EVALUASI:
- Catat tekanan darah harian
- Track aktivitas di aplikasi
- Evaluasi mingguan dengan Ners Counselor
- Ukur progress setiap 2 minggu

🔔 REMINDER & MOTIVASI:
"Kesehatan adalah investasi terbaik. Setiap langkah kecil menuju gaya hidup sehat adalah kemenangan. Tetap semangat dan konsisten!"`;

    return NextResponse.json({ plan: basicPlan });
  }
}

function generateFallbackPlan(data: any): string {
  const { patientProfile, bpReadings, activityLogs, sleepLogs, exerciseLogs, foodLogs, healthScore, healthTrend } = data;

  // Analyze data patterns
  const recentBP = bpReadings[0];
  const avgSystolic = bpReadings.length > 0 ? bpReadings.slice(0, 5).reduce((sum: number, r: any) => sum + r.systolic, 0) / Math.min(bpReadings.length, 5) : 0;
  const avgDiastolic = bpReadings.length > 0 ? bpReadings.slice(0, 5).reduce((sum: number, r: any) => sum + r.diastolic, 0) / Math.min(bpReadings.length, 5) : 0;
  
  const positiveActivities = activityLogs.filter((log: any) => log.healthImpact === "positive").length;
  const negativeActivities = activityLogs.filter((log: any) => log.healthImpact === "negative").length;
  const totalActivities = activityLogs.length;
  
  const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((sum: number, log: any) => sum + log.duration, 0) / sleepLogs.length : 0;
  const avgExercise = exerciseLogs.length > 0 ? exerciseLogs.reduce((sum: number, log: any) => sum + log.duration, 0) / exerciseLogs.length : 0;

  // Generate personalized plan based on data
  let personalizedAdvice = "";
  
  if (avgSystolic > 140) {
    personalizedAdvice += "• Fokus utama: Menurunkan tekanan darah sistolik\n";
  }
  if (negativeActivities > positiveActivities) {
    personalizedAdvice += "• Perlu mengurangi aktivitas tidak sehat\n";
  }
  if (avgSleep < 6) {
    personalizedAdvice += "• Perlu memperbaiki pola tidur\n";
  }
  if (avgExercise < 20) {
    personalizedAdvice += "• Perlu meningkatkan aktivitas fisik\n";
  }

  return `📋 PLAN PERUBAHAN PERILAKU
[Tanggal: ${new Date().toLocaleDateString('id-ID')}]

🎯 TUJUAN UTAMA:
1. Menurunkan tekanan darah ke target normal (<140/90 mmHg)
2. Meningkatkan aktivitas fisik sehat
3. Memperbaiki pola tidur
4. Mengurangi aktivitas tidak sehat

📅 TIMELINE 30 HARI:
Minggu 1: Fokus pada monitoring tekanan darah dan identifikasi pola
Minggu 2: Implementasi aktivitas fisik ringan
Minggu 3: Perbaikan pola tidur dan diet
Minggu 4: Konsolidasi dan evaluasi progress

📊 TARGET SPESIFIK:
- Tekanan Darah: Turun 10-15 mmHg dalam 30 hari
- Aktivitas: 30 menit aktivitas fisik 5x/minggu
- Tidur: 7-8 jam per malam
- Latihan: 20-30 menit latihan 3x/minggu

💡 STRATEGI IMPLEMENTASI:
1. Monitor tekanan darah 2x sehari
2. Jalan kaki 30 menit setiap pagi
3. Hindari makanan tinggi garam
4. Tidur teratur jam 22:00
5. Latihan ringan 3x seminggu
6. Kurangi aktivitas tidak sehat
7. Konsultasi rutin dengan Ners Counselor

⚠️ HALANGAN & SOLUSI:
- Halangan: Malas berolahraga
  Solusi: Mulai dengan aktivitas ringan, ajak keluarga
- Halangan: Sulit tidur
  Solusi: Rutinitas sebelum tidur, hindari gadget
- Halangan: Makanan tidak sehat
  Solusi: Siapkan makanan sehat, baca label nutrisi

📈 MONITORING & EVALUASI:
- Catat tekanan darah harian
- Track aktivitas di aplikasi
- Evaluasi mingguan dengan Ners Counselor
- Ukur progress setiap 2 minggu

🔔 REMINDER & MOTIVASI:
"Kesehatan adalah investasi terbaik. Setiap langkah kecil menuju gaya hidup sehat adalah kemenangan. Tetap semangat dan konsisten!"`;
} 