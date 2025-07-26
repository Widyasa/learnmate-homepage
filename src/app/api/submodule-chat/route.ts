import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Enhanced retry function with better error handling
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 2000): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      console.log(`Attempt ${i + 1} failed:`, error.message)

      // Check if it's a retryable error
      const errorMessage = error.message?.toLowerCase() || ""
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("temporarily unavailable")

      if (i === maxRetries - 1 || !isRetryable) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
      console.log(`Waiting ${delay}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Fallback responses for sub-module specific questions
function getSubModuleFallbackResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()
  const subModuleTitle = context?.currentSubModule?.title || "materi ini"
  const moduleTitle = context?.moduleTitle || "Python"

  // Video/Learning specific questions
  if (lowerMessage.includes("video") || lowerMessage.includes("materi")) {
    return `**Tentang Video "${subModuleTitle}":**

**📹 Ringkasan Materi:**
Video ini membahas konsep penting dalam pembelajaran ${moduleTitle}. Berikut poin-poin utama yang perlu dipahami:

**🎯 Poin Pembelajaran Utama:**
1. **Konsep Dasar** - Memahami fundamental dari topik ini
2. **Implementasi Praktis** - Cara menerapkan dalam kode
3. **Best Practices** - Tips dan trik untuk coding yang baik
4. **Common Mistakes** - Kesalahan yang sering terjadi

**💡 Tips Belajar:**
- **Pause dan praktik** - Jangan hanya menonton, ikuti coding
- **Catat poin penting** - Buat notes untuk review nanti
- **Ulangi jika perlu** - Tidak masalah menonton berkali-kali
- **Praktik mandiri** - Coba variasi dari contoh yang diberikan

**🔧 Contoh Kode Sederhana:**
\`\`\`python
# Contoh implementasi dasar
def hello_python():
    print("Selamat belajar ${moduleTitle}!")
    return "Success"

# Panggil function
result = hello_python()
print(f"Status: {result}")
\`\`\`

**❓ Pertanyaan untuk Self-Check:**
- Apakah saya sudah memahami konsep utama?
- Bisakah saya menjelaskan dengan kata-kata sendiri?
- Sudahkah saya mencoba coding sendiri?

Lanjutkan belajar dengan semangat! 🚀`
  }

  // Practice/Exercise questions
  if (lowerMessage.includes("praktik") || lowerMessage.includes("latihan") || lowerMessage.includes("exercise")) {
    return `**Panduan Praktik untuk "${subModuleTitle}":**

**🏋️ Latihan Mandiri:**

**Level 1 - Basic Practice:**
\`\`\`python
# Latihan 1: Modifikasi contoh dari video
# Coba ubah nilai atau parameter yang ada

# Latihan 2: Tambahkan fitur sederhana
# Extend kode dengan functionality baru
\`\`\`

**Level 2 - Intermediate Challenge:**
\`\`\`python
# Challenge: Buat variasi yang lebih kompleks
# Kombinasikan dengan materi sebelumnya

def practice_function():
    # Your code here
    pass
\`\`\`

**🎯 Fokus Praktik:**
1. **Ketik ulang kode** - Jangan copy-paste, ketik manual
2. **Eksperimen** - Coba ubah nilai dan lihat hasilnya
3. **Debug** - Sengaja buat error dan perbaiki
4. **Dokumentasi** - Tambahkan comment pada kode

**🔍 Self-Assessment:**
- [ ] Saya bisa menjalankan kode tanpa error
- [ ] Saya memahami setiap baris kode
- [ ] Saya bisa menjelaskan output yang dihasilkan
- [ ] Saya bisa membuat variasi sendiri

**💪 Next Steps:**
Setelah menguasai praktik ini, lanjut ke sub-modul berikutnya atau coba challenge yang lebih advanced!

Keep practicing! 🔥`
  }

  // Concept/Theory questions
  if (lowerMessage.includes("konsep") || lowerMessage.includes("teori") || lowerMessage.includes("pengertian")) {
    return `**Penjelasan Konsep "${subModuleTitle}":**

**🧠 Pemahaman Konsep:**
Materi ini adalah bagian fundamental dalam pembelajaran ${moduleTitle}. Mari kita breakdown konsepnya:

**📚 Definisi:**
Konsep ini berkaitan dengan cara ${moduleTitle} menangani dan memproses data/logic tertentu.

**🔗 Hubungan dengan Materi Lain:**
- **Prerequisite:** Materi sebelumnya yang perlu dikuasai
- **Connection:** Bagaimana ini terhubung dengan konsep lain
- **Application:** Dimana konsep ini digunakan dalam real-world

**💭 Analogi Sederhana:**
Bayangkan konsep ini seperti... [analogi yang mudah dipahami berdasarkan konteks materi]

**🎨 Visualisasi Konsep:**
\`\`\`
Input → Process → Output
  ↓       ↓        ↓
Data → Function → Result
\`\`\`

**🔧 Implementasi Dasar:**
\`\`\`python
# Contoh sederhana konsep ini
def demonstrate_concept():
    # Step 1: Setup
    # Step 2: Process  
    # Step 3: Return result
    pass
\`\`\`

**❗ Poin Penting:**
- Konsep ini akan digunakan berulang kali
- Pemahaman yang kuat di sini = mudah di materi selanjutnya
- Praktik langsung akan memperkuat pemahaman

Pahami dulu konsepnya, baru praktik! 🎯`
  }

  // Default fallback for sub-module context
  return `**AI Assistant untuk "${subModuleTitle}"** 🤖

Maaf, saya sedang mengalami beban tinggi, tapi tetap siap membantu pembelajaran Anda!

**📖 Tentang Materi Ini:**
Anda sedang belajar "${subModuleTitle}" dalam modul ${moduleTitle}. Ini adalah bagian penting dari journey programming Anda.

**💡 Quick Tips untuk Materi Ini:**
1. **Watch Actively** - Jangan hanya menonton, ikuti setiap langkah
2. **Take Notes** - Catat poin-poin penting
3. **Practice Immediately** - Langsung praktik setelah menonton
4. **Ask Questions** - Jangan ragu bertanya jika ada yang tidak jelas

**🔧 Debugging Tips:**
\`\`\`python
# Jika ada error, cek:
print("Debug: Check your code step by step")

# Common issues:
# 1. Typo in variable names
# 2. Indentation errors  
# 3. Missing imports
# 4. Wrong data types
\`\`\`

**📚 Untuk Pembelajaran Optimal:**
- Tonton video sampai selesai
- Pause di bagian penting untuk praktik
- Ulangi jika ada yang belum jelas
- Lanjut ke sub-modul berikutnya setelah paham

**🎯 Remember:**
Setiap expert programmer pernah menjadi beginner. Yang penting adalah konsistensi dan tidak menyerah!

Silakan tanya lagi atau lanjutkan ke materi berikutnya! 🚀`
}

export async function POST(request: NextRequest) {
  try {
    const { message, subModuleTitle, moduleId } = await request.json()

    if (!message || !subModuleTitle || !moduleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const language = moduleId.includes("python") ? "Python" : "PHP"

    const systemPrompt = `Anda adalah AI Assistant untuk pembelajaran ${language}. 
    Saat ini user sedang mempelajari sub-modul: "${subModuleTitle}".
    
    Tugas Anda:
    - Berikan jawaban yang relevan dengan materi sub-modul ini
    - Gunakan bahasa Indonesia yang mudah dipahami
    - Berikan contoh kode jika diperlukan
    - Fokus pada pembelajaran dan pemahaman konsep
    - Jika user bertanya di luar topik, arahkan kembali ke materi
    
    Konteks pembelajaran: ${language} untuk pemula`

    

    const { text } = await generateText({
      model: xai("grok-beta"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 500,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in submodule chat:", error)

    // Fallback response
    const fallbackResponse = `Maaf, saya sedang mengalami gangguan. Namun saya tetap bisa membantu dengan pertanyaan dasar tentang materi ini. Silakan coba lagi atau tanyakan hal yang lebih spesifik tentang pembelajaran.`

    return NextResponse.json({ response: fallbackResponse })
  }
}
