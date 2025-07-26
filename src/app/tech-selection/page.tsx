"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Server, Palette, Brain, BarChart3, Shield } from "lucide-react"

interface TechField {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const techFields: TechField[] = [
  {
    id: "frontend",
    name: "Front End",
    icon: <Monitor className="w-8 h-8" />,
    description: "User interface dan pengalaman pengguna",
  },
  {
    id: "backend",
    name: "Back End",
    icon: <Server className="w-8 h-8" />,
    description: "Server, database, dan logika aplikasi",
  },
  {
    id: "uiux",
    name: "UI/UX",
    icon: <Palette className="w-8 h-8" />,
    description: "Desain antarmuka dan pengalaman pengguna",
  },
  {
    id: "machinelearning",
    name: "Machine Learning",
    icon: <Brain className="w-8 h-8" />,
    description: "Kecerdasan buatan dan pembelajaran mesin",
  },
  {
    id: "datascience",
    name: "Data Science",
    icon: <BarChart3 className="w-8 h-8" />,
    description: "Analisis data dan visualisasi",
  },
  {
    id: "cybersecurity",
    name: "Cyber Security",
    icon: <Shield className="w-8 h-8" />,
    description: "Keamanan sistem dan jaringan",
  },
]

export default function TechSelectionPage() {
  const [selectedTech, setSelectedTech] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Always redirect to login first - user must login to access tech selection
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    // Check if user has completed quiz
    const quizAnswers = localStorage.getItem("quizAnswers")
    if (!quizAnswers) {
      router.push("/quiz")
      return
    }

    setIsLoggedIn(true)
    setIsLoading(false)
  }, [router])

  const handleTechSelect = (techId: string) => {
    setSelectedTech(techId)
  }

  const handleNext = () => {
    if (selectedTech) {
      // Save selected tech to localStorage
      localStorage.setItem("selectedTech", selectedTech)
      // Redirect to quiz results page for AI analysis
      router.push("/quiz-results")
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

  return (
    <div className="min-h-screen py-16 md:py-0 h-full flex flex-col justify-center items-center"
            style={{
              backgroundImage: "url('/images/bg.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
            }}
    >
      {/* Header - Tech Selection Mode (No Logout Button, Disabled Navbar) */}


      {/* Main Content */}
      <div className="container mx-auto px-4 ">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Pilih Bidang yang Kamu Minati</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan bidang yang paling kamu sukai sebagai langkah awal menentukan arah belajar.
            </p>
          </div>

          {/* Tech Fields Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {techFields.map((tech) => (
              <Card
                key={tech.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTech === tech.id ? "ring-2 ring-teal-500 bg-teal-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleTechSelect(tech.id)}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedTech === tech.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tech.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{tech.name}</h3>
                  <p className="text-gray-600 text-sm">{tech.description}</p>
                  {selectedTech === tech.id && (
                    <div className="mt-4">
                      <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!selectedTech}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
