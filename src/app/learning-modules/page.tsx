"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Menu, X } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"

export interface Module {
  category_id: number        // bigint
  category_name: string      // text
  module_id: number          // bigint
  module_title: string       // text
  module_slug: string        // text
  module_summary: string     // text
  learning_benefits: string  // text
  module_description: string // text
  thumbnail: string          // text
  module_created_at: string  // timestamp with time zone (ISO string)
  total_submodules: number   // bigint
  total_duration_minutes: number // bigint
}


export default function LearningModulesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedModules, setRecommendedModules] = useState<Module[]>([])
  const [userTech, setUserTech] = useState("")
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Check login status on component mount
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"
    setIsLoggedIn(loggedIn)
  }, [])

useEffect(() => {
  async function fetchModules() {
    setIsLoading(true)
    // Ambil student_id dari localStorage
    const student = localStorage.getItem("student")
    let student_id = ""
    if (student) {
      try {
        const studentObj = JSON.parse(student)
        student_id = studentObj.id || studentObj.user_id || ""
      } catch (e) {}
    }
    if (!student_id) {
      router.push("/login")
      return
    }

    // Ambil bidang minat dari student_quizz
    const { data: quizz, error: quizzError } = await supabaseClient
      .from("student_quizz")
      .select("specialization")
      .eq("student_id", student_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (quizzError || !quizz?.specialization) {
      setIsLoading(false)
      return
    }
    setUserTech(quizz.specialization)

    // Ambil modul dari view sesuai category_name
    const { data: modulesData, error: modulesError } = await supabaseClient
      .from("view_modules_with_summary")
      .select("*")
      .eq("category_name", quizz.specialization)
      .order("module_created_at", { ascending: true })

    setRecommendedModules(modulesData || [])
    setIsLoading(false)
  }
  fetchModules()
}, [router])

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("selectedTech")
    localStorage.removeItem("aiAnalysis")
    localStorage.removeItem("quizAnswers")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  const handleProtectedRoute = (route: string) => {
    if (isLoggedIn) {
      router.push(route)
    } else {
      router.push("/login")
    }
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
          <header className="border-b border-gray-100 px-4 py-5 fixed w-full top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="images/logo.png" alt="" className=""/>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className=" hover:text-teal-600 font-medium transition-colors text-lg ">
              Home
            </Link>
            <button
              onClick={() => handleProtectedRoute("/learncore")}
              className=" hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg text-teal-600  border-b-2 border-teal-600"
            >
              LearnCore
            </button>
            <button
              onClick={() => handleProtectedRoute("/chatbot")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg"
            >
              Chatbot
            </button>
            <button
              onClick={() => handleProtectedRoute("/timer")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg"
            >
              Timer
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <Button onClick={handleLogout} className="py-6 px-8 text-[16px] bg-teal-600 hover:bg-teal-700 transition-colors">
                Logout
              </Button>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="py-6 px-8 text-[16px] border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent transition-colors"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="py-6 px-8 text-[16px] bg-teal-600 hover:bg-teal-700 transition-colors">Login</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium">
                Home
              </Link>
              <button
                onClick={() => handleProtectedRoute("/learncore")}
                className="text-gray-700 hover:text-teal-600 font-medium text-left"
              >
                LearnCore
              </button>
              <button
                onClick={() => handleProtectedRoute("/chatbot")}
                className="text-gray-700 hover:text-teal-600 font-medium text-left"
              >
                Chatbot
              </button>
              <button
                onClick={() => handleProtectedRoute("/timer")}
                className="text-gray-700 hover:text-teal-600 font-medium text-left"
              >
                Timer
              </button>
            </nav>
            <div className="flex flex-col space-y-3 mt-6">
              {isLoggedIn ? (
                <Button onClick={handleLogout} className="bg-teal-600 hover:bg-teal-700">
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">Login</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 mt-20">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Rekomendasi Modul Pembelajaran</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kuis ini digunakan untuk mengukur sejauh mana pemahaman peserta sebelum memulai materi. Hasilnya membantu
            menyesuaikan pendekatan belajar agar lebih efektif.
          </p>
          {userTech && (
            <div className="mt-4 inline-block bg-teal-50 px-4 py-2 rounded-full">
              <span className="text-teal-700 font-medium capitalize">Dipersonalisasi untuk: {userTech}</span>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {recommendedModules.map((module) => (
            <div
              key={module.module_id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Module Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={module.thumbnail || "/placeholder.svg"}
                  alt={module.module_title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Module Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-500 mb-2">{module.module_title.length > 25 ? module.module_title.slice(0, 25) + "..." : module.module_title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">{module.module_summary}</p>

                {/* Duration */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{module.total_duration_minutes} Menit</span>
                </div>

                {/* Learn Button */}
                  <Link
                    href={`/module/${module.module_id}`}
                  >
                    <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-medium">
                      Mulai Belajar
                    </button>
                  </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Tagline */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-teal-600 text-white px-2 py-1 rounded font-bold text-lg">LM</div>
                <div>
                  <div className="font-bold text-lg">Your Smart</div>
                  <div className="font-bold text-lg">Learning Mate</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Copyright by AvardAI. All rights reserved.</p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/learning-modules" className="hover:text-white">
                    Learncore
                  </Link>
                </li>
                <li>
                  <Link href="/chatbot" className="hover:text-white">
                    Chatbot
                  </Link>
                </li>
                <li>
                  <Link href="/timer" className="hover:text-white">
                    Timer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Kontak Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Testimoni
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Terms & Policies */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Terms & Policies</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Ketentuan Pengguna
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
