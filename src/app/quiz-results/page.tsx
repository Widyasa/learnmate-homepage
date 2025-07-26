"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Brain, Target, TrendingUp, ArrowRight } from "lucide-react"

export default function QuizResultsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [quizScore, setQuizScore] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [selectedTech, setSelectedTech] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)

    // Get quiz answers and selected tech
    const quizAnswers = JSON.parse(localStorage.getItem("quizAnswers") || "{}")
    const tech = localStorage.getItem("selectedTech") || ""
    const student_id = localStorage.getItem("student_id") || ""


    if (!quizAnswers || Object.keys(quizAnswers).length === 0 || !tech) {
      router.push("/quiz")
      return
    }

    setSelectedTech(tech)
    analyzeQuizResults(quizAnswers, tech, student_id)
  }, [])

  const analyzeQuizResults = async (quizAnswers: any, selectedTech: string, student_id: any) => {
    try {
      const response = await fetch("/api/analyze-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizAnswers,
          selectedTech,
          student_id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQuizScore(data.score)
        setAiAnalysis(data.analysis)

        // Save analysis to localStorage
        localStorage.setItem("aiAnalysis", data.analysis)
      } else {
        throw new Error("Failed to analyze quiz")
      }
    } catch (error) {
      console.error("Error analyzing quiz:", error)
      // Fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(quizAnswers, selectedTech)
      setQuizScore(calculateScore(quizAnswers))
      setAiAnalysis(fallbackAnalysis)
      localStorage.setItem("aiAnalysis", fallbackAnalysis)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateScore = (answers: any) => {
    const totalQuestions = Object.keys(answers).length
    if (totalQuestions === 0) return 0

    let correctAnswers = 0
    Object.values(answers).forEach((answer: any) => {
      if (typeof answer === "string" && answer.length > 0) {
        correctAnswers++
      }
    })

    return Math.round((correctAnswers / totalQuestions) * 100)
  }

  const generateFallbackAnalysis = (answers: any, tech: string) => {
    const score = calculateScore(answers)

    return `**Skor Kuis Anda: ${score}/100**

**Analisis Mendalam:**
Berdasarkan jawaban kuis dan pilihan teknologi ${tech}, Anda menunjukkan minat yang baik dalam bidang teknologi. Dengan skor ${score}%, Anda memiliki dasar pemahaman yang ${score >= 70 ? "solid" : "perlu diperkuat"} untuk memulai perjalanan belajar.

**Rekomendasi Pembelajaran:**
1. **Mulai dengan Fundamental** - Pelajari konsep dasar ${tech} terlebih dahulu
2. **Praktik Konsisten** - Dedikasikan waktu harian untuk coding
3. **Project-Based Learning** - Buat project kecil untuk mengaplikasikan ilmu
4. **Join Community** - Bergabung dengan komunitas developer untuk networking

**Langkah Selanjutnya:**
Fokus pada modul pembelajaran yang telah dipersonalisasi berdasarkan minat Anda di ${tech}. Mulai dari level dasar dan tingkatkan secara bertahap.`
  }

  const parseFormattedText = (text: string) => {
    // Split text into paragraphs
    const paragraphs = text.split("\n\n")

    return paragraphs.map((paragraph, index) => {
      // Handle bold text with **
      const parts = paragraph.split(/(\*\*.*?\*\*)/)

      return (
        <div key={index} className="mb-4">
          {parts.map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              // Remove ** and make bold
              const boldText = part.slice(2, -2)
              return (
                <strong key={partIndex} className="font-semibold text-gray-900">
                  {boldText}
                </strong>
              )
            }
            // Handle line breaks within paragraphs
            return part.split("\n").map((line, lineIndex) => (
              <span key={`${partIndex}-${lineIndex}`}>
                {line}
                {lineIndex < part.split("\n").length - 1 && <br />}
              </span>
            ))
          })}
        </div>
      )
    })
  }

  const handleContinue = () => {
    router.push("/learning-modules")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
            style={{
                    backgroundImage: "url('/images/bg.svg')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Menganalisis hasil kuis Anda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4"
        style={{
              backgroundImage: "url('/images/bg.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
            }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Kuis Anda</h1>
          <p className="text-gray-600">Analisis personal berdasarkan jawaban dan minat teknologi Anda</p>
        </div>

        {/* Score Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-teal-100 p-3 rounded-full">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Skor: {quizScore}/100</h2>
                  <p className="text-gray-600 capitalize">Minat Teknologi: {selectedTech}</p>
                </div>
              </div>
              <Badge
                variant={quizScore >= 80 ? "default" : quizScore >= 60 ? "secondary" : "outline"}
                className="text-sm px-4 py-2"
              >
                {quizScore >= 80 ? "Excellent" : quizScore >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analisis AI</h2>
                <p className="text-gray-600">Powered by Gemini AI</p>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed">{parseFormattedText(aiAnalysis)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Langkah Selanjutnya</h2>
                <p className="text-gray-600">Mulai perjalanan pembelajaran Anda</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">
                Berdasarkan hasil analisis, kami telah menyiapkan modul pembelajaran yang dipersonalisasi khusus untuk
                minat Anda di bidang <strong>{selectedTech}</strong>.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Modul pembelajaran yang disesuaikan dengan level Anda</li>
                <li>• Project-based learning untuk praktik langsung</li>
                <li>• AI Assistant untuk membantu proses belajar</li>
                <li>• Progress tracking untuk memantau perkembangan</li>
              </ul>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-lg font-semibold"
            >
              Mulai Belajar Sekarang
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
