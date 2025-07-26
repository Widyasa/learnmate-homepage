"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface Question {
  id: number
  category: string
  question: string
  options: string[]
  correctAnswer: number
}

const questions: Question[] = [
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

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Always redirect to login first - user must login to access quiz
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)
    setIsLoading(false)
  }, [router])

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: Number.parseInt(value),
    }))
  }

   const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Save quiz answers to localStorage
      localStorage.setItem("quizAnswers", JSON.stringify(answers))
      // Ambil student_id dari localStorage
      const student = localStorage.getItem("student")
      let student_id = ""
      if (student) {
        try {
          student_id = JSON.parse(student).id
        } catch (e) {
          student_id = ""
        }
      }
      // Simpan student_id ke localStorage
      localStorage.setItem("student_id", student_id)
      // Redirect to tech selection page after completing quiz
      router.push("/tech-selection")
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Quiz Mode (No Logout Button, Disabled Navbar) */}

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Kuis Pemahaman Awal</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Kuis ini digunakan untuk mengukur sejauh mana pemahaman peserta sebelum memulai materi.
              <br />
              Hasilnya membantu menyesuaikan pendekatan belajar agar lebih efektif.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Progress</span>
              <span className="text-sm text-gray-500">
                {currentQuestion + 1} dari {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="mb-6">
              <span className="inline-block bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full mb-4">
                {currentQ.category}
              </span>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {currentQ.id}. {currentQ.question}
              </h2>
            </div>

            <RadioGroup
              value={answers[currentQuestion]?.toString() || ""}
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleAnswerChange(index.toString())}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent disabled:opacity-50"
            >
              ← Sebelumnya
            </Button>

            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
            >
              {currentQuestion === questions.length - 1 ? "Selesai" : "Selanjutnya →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
