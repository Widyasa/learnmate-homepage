import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
  const { quizAnswers, selectedTech, student_id } = await request.json()
 
    const allQuestions = [
  // Front End Questions (3 questions)
  {
    id: 1,
    category: "Front End",
    question: "Apa kepanjangan dari HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    category: "Front End",
    question: "CSS digunakan untuk apa dalam web development?",
    options: ["Membuat database", "Styling dan layout halaman web", "Membuat server", "Mengelola file"],
    correctAnswer: 1,
  },
  {
    id: 3,
    category: "Front End",
    question: "Framework JavaScript yang populer untuk membuat user interface adalah?",
    options: ["Django", "Laravel", "React", "Spring"],
    correctAnswer: 2,
  },

  // Back End Questions (3 questions)
  {
    id: 4,
    category: "Back End",
    question: "Apa fungsi utama dari server dalam web development?",
    options: [
      "Menampilkan gambar",
      "Memproses request dan mengirim response",
      "Membuat animasi",
      "Mengatur warna website",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    category: "Back End",
    question: "Database yang paling umum digunakan untuk menyimpan data adalah?",
    options: ["Photoshop", "MySQL", "Microsoft Word", "Adobe Illustrator"],
    correctAnswer: 1,
  },
  {
    id: 6,
    category: "Back End",
    question: "API adalah singkatan dari?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Integration",
      "Automated Program Instruction",
      "Application Process Integration",
    ],
    correctAnswer: 0,
  },

  // UI/UX Questions (2 questions)
  {
    id: 7,
    category: "UI/UX",
    question: "Apa perbedaan utama antara UI dan UX?",
    options: [
      "UI adalah tampilan, UX adalah pengalaman pengguna",
      "UI dan UX adalah hal yang sama",
      "UI untuk mobile, UX untuk web",
      "UI untuk developer, UX untuk designer",
    ],
    correctAnswer: 0,
  },
  {
    id: 8,
    category: "UI/UX",
    question: "Tool yang umum digunakan untuk membuat prototype UI/UX adalah?",
    options: ["Microsoft Excel", "Figma", "Notepad", "Calculator"],
    correctAnswer: 1,
  },

  // Machine Learning Questions (3 questions)
  {
    id: 9,
    category: "Machine Learning",
    question: "Apa itu Machine Learning?",
    options: [
      "Mesin yang bisa bergerak",
      "Komputer yang belajar dari data tanpa diprogram secara eksplisit",
      "Software untuk mengedit video",
      "Hardware komputer",
    ],
    correctAnswer: 1,
  },
  {
    id: 10,
    category: "Machine Learning",
    question: "Bahasa pemrograman yang paling populer untuk Machine Learning adalah?",
    options: ["HTML", "CSS", "Python", "Microsoft Word"],
    correctAnswer: 2,
  },
  {
    id: 11,
    category: "Machine Learning",
    question: "Apa itu supervised learning?",
    options: [
      "Belajar dengan pengawasan guru",
      "Pembelajaran dengan data yang sudah memiliki label/jawaban",
      "Belajar tanpa komputer",
      "Pembelajaran online",
    ],
    correctAnswer: 1,
  },

  // Data Science Questions (2 questions)
  {
    id: 12,
    category: "Data Science",
    question: "Apa tujuan utama dari Data Science?",
    options: [
      "Membuat website",
      "Menganalisis data untuk mendapatkan insight dan membuat keputusan",
      "Mengedit foto",
      "Bermain game",
    ],
    correctAnswer: 1,
  },
  {
    id: 13,
    category: "Data Science",
    question: "Tool yang umum digunakan untuk visualisasi data adalah?",
    options: ["Photoshop", "Tableau", "Microsoft Paint", "Notepad"],
    correctAnswer: 1,
  },

  // Cyber Security Questions (2 questions)
  {
    id: 14,
    category: "Cyber Security",
    question: "Apa itu firewall dalam konteks keamanan siber?",
    options: [
      "Dinding yang terbakar",
      "Sistem keamanan yang mengontrol lalu lintas jaringan",
      "Software untuk mengedit video",
      "Hardware untuk gaming",
    ],
    correctAnswer: 1,
  },
  {
    id: 15,
    category: "Cyber Security",
    question: "Apa yang dimaksud dengan phishing?",
    options: [
      "Memancing ikan",
      "Teknik penipuan untuk mencuri informasi pribadi",
      "Bermain game online",
      "Mengedit dokumen",
    ],
    correctAnswer: 1,
  },
]

    let correctCount = 0
    let wrongCount = 0
    const answerDetails = allQuestions.map((q) => {
      const userAnswerIdx = quizAnswers[q.id - 1]
      const isCorrect = userAnswerIdx === q.correctAnswer
      if (isCorrect) correctCount++
      else wrongCount++
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: userAnswerIdx !== undefined ? q.options[userAnswerIdx] : null,
        isCorrect,
      }
    })

    const score = Math.round((correctCount / allQuestions.length) * 100)
    if (!quizAnswers || !selectedTech || !student_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }


    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })


    const prompt = `
Kamu adalah AI Learning Analyst yang ahli dalam menganalisis hasil kuis pembelajaran programming dan teknologi.

DATA YANG PERLU DIANALISIS:
- Skor Kuis: ${score}/100
- Jumlah Jawaban Benar: ${correctCount}
- Jumlah Jawaban Salah: ${wrongCount}
- Bidang Minat: ${selectedTech}
- Detail Jawaban:
${answerDetails.map((d, i) => `
${i + 1}. ${d.question}
   - Jawaban Pengguna: ${d.userAnswer ?? "Belum dijawab"}
   - Jawaban Benar: ${d.correctAnswer}
   - Status: ${d.isCorrect ? "Benar" : "Salah"}
`).join("\n")}


TUGAS:
Buatlah analisis komprehensif dalam bahasa Indonesia dengan format berikut:

**Skor Kuis Anda: ${score}/100**

**Analisis Mendalam:**
[Berikan analisis detail tentang jawaban pengguna, kekuatan dan area yang perlu diperbaiki berdasarkan jawaban kuis dan pilihan teknologi. Jelaskan mengapa skor ini diperoleh dan apa artinya untuk perjalanan belajar mereka.]

**Rekomendasi Pembelajaran:**
[Berikan 4-5 rekomendasi spesifik dan actionable berdasarkan hasil analisis, gunakan format numbered list]

**Langkah Selanjutnya:**
[Berikan guidance konkret untuk memulai pembelajaran di bidang ${selectedTech}, termasuk saran modul atau topik yang harus diprioritaskan]

INSTRUKSI FORMATTING:
- Gunakan **text** untuk membuat text bold/tebal
- Maksimal 300 kata total
- Berikan analisis yang personal dan motivational
- Fokus pada actionable insights
- Gunakan bahasa yang encouraging dan supportive

Berikan analisis yang comprehensive dan helpful!
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysis = response.text()
    console.log("Analysis:", analysis)

    // Simpan ke database student_quizz
   const { data: existingQuizz } = await supabase
  .from("student_quizz")
  .select("id")
  .eq("student_id", student_id)
  .single()

    if (!existingQuizz) {
      // Insert jika belum ada
      const { error: dbError } = await supabase
        .from("student_quizz")
        .insert([
          {
            student_id,
            result: analysis,
            score,
            correct_count: correctCount,
            wrong_count: wrongCount,
            specialization: selectedTech,
          },
        ])
      if (dbError) {
        console.error("Error saving to student_quizz:", dbError)
        return NextResponse.json({ error: "Failed to save quiz analysis" }, { status: 500 })
      }
    }

    return NextResponse.json({
      score,
      analysis,
      selectedTech,
    })
  } catch (error) {
    console.error("Error analyzing quiz:", error)
    return NextResponse.json({ error: "Failed to analyze quiz results" }, { status: 500 })
  }
}
