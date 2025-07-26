"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Award, MessageCircle, Play, ChevronLeft, ChevronRight, X, Menu, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check login status on component mount
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"
    setIsLoggedIn(loggedIn)
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    // Force page reload to ensure clean state
    window.location.href = "/"
  }

  // Handle protected route clicks
  const handleProtectedRoute = (route: string) => {
    const currentLoginStatus = localStorage.getItem("isLoggedIn") === "true"
    if (currentLoginStatus) {
      router.push(route)
    } else {
      router.push("/login")
    }
  }

  const testimonials = [
  {
    name: "Rizky Pratama",
    text: "Belajar di LearnMate bikin aku paham materi lebih cepat. Fitur AI-nya sangat membantu saat aku stuck.",
  },
  {
    name: "Dewi Lestari",
    text: "Sertifikat dari LearnMate langsung bisa aku pakai untuk melamar kerja. Progres belajarnya juga jelas banget.",
  },
  {
    name: "Andi Saputra",
    text: "Tutor virtualnya responsif dan selalu siap jawab pertanyaan. Aku jadi lebih percaya diri menghadapi ujian.",
  },
  {
    name: "Siti Nurhaliza",
    text: "Materi yang dipersonalisasi bikin aku nggak bosan belajar. Setiap hari ada motivasi baru dari platform ini.",
  },
  {
    name: "Budi Santoso",
    text: "LearnMate membantu aku lulus kuliah lebih cepat. Analisis kemajuan belajarnya sangat detail dan akurat.",
  },
  {
    name: "Fitriani",
    text: "Platformnya mudah digunakan, dan aku bisa belajar kapan saja. Sangat cocok untuk mahasiswa yang sibuk.",
  },
]

const [modules, setModules] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchModules() {
      const { data: modulesData } = await supabaseClient
      .from("view_modules_with_summary")
      .select("*")
      .order("module_created_at", { ascending: true })
      .range(0, 3) 
      console.error("Error fetching modules:", modulesData)
      setModules(modulesData || [])
    }
    fetchModules()
  }, [])

  // Slider navigation
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? modules.length - 1 : prev - 1))
  }
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === modules.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-100 px-4 py-4 fixed w-full top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="logo.svg" alt="" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className=" hover:text-teal-600 font-medium transition-colors text-lg text-teal-600  border-b-2 border-teal-600">
              Home
            </Link>
            <button
              onClick={() => handleProtectedRoute("/learncore")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg"
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
              <Button onClick={handleLogout} className="bg-teal-600 hover:bg-teal-700 transition-colors">
                Logout
              </Button>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent transition-colors"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-teal-600 hover:bg-teal-700 transition-colors">Login</Button>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 min-h-screen ">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <Badge className="bg-teal-100 text-teal-800 mb-6 px-4 py-2 text-sm font-medium">
            Personalisasi AI dengan Teknologi Terdepan
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-orange-400">LearnMate:</span>{" "}
            <span className="text-gray-800">Your Smart Learning Companion</span>
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl mb-8 leading-relaxed max-w-2xl">
            Platform pembelajaran AI yang dirancang untuk memberikan pengalaman belajar yang dipersonalisasi dan efektif
            untuk mendukung setiap langkah perjalanan belajar Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button className="bg-teal-600 hover:bg-teal-700 p-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
              Mulai Belajar Gratis
            </Button>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 p-6 text-sm font-semibold transition-all bg-transparent"
            >
              Lihat Semua Materi
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-orange-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <Image
              src="/images/hero-img.png"
              alt="LearnMate AI Robot Mascot"
              width={500}
              height={500}
              className="relative z-10 max-w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>

      {/* Why Learn Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Kenapa Harus Belajar di <span className="text-orange-400">LearnMate</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              LearnMate menghadirkan inovasi belajar personal via AI dan dalam waktu 24/7 untuk membantu kamu belajar
              lebih cepat dan lebih efektif.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Jalur Belajar Pribadi</h3>
                <p className="text-gray-600 text-sm">
                  AI otomatis menyesuaikan materi sesuai progress dan gaya belajar
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Virtual Lecturer</h3>
                <p className="text-gray-600 text-sm">Dosen Virtual siap siap expert menjawab pertanyaan</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Virtual Lecturer</h3>
                <p className="text-gray-600 text-sm">Dosen Virtual siap expert menjawab pertanyaan</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Selalu Siap</h3>
                <p className="text-gray-600 text-sm">LearnMate hadir pernah tidak siap membantu</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Transformation Section */}
       <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-orange-200 rounded-2xl blur-2xl opacity-30"></div>
                <Image
                  src="/images/benefit-img.png"
                  alt="Student learning with AI"
                  width={600}
                  height={600}
                  className="relative z-10 rounded-2xl shadow-2xl"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8 leading-tight">
                Transformasi Belajarmu <span className="text-orange-400">dengan AI</span>
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Tidak lagi metode belajar konvensional yang sama untuk semua orang. AI kami dirancang khusus untuk
                memberikan pengalaman belajar yang benar-benar personal.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Real Progress, Real Result</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Tracking kemajuan belajar secara real-time dengan analisis mendalam dan insights yang actionable
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Personalisasi Setiap Individu</h4>
                    <p className="text-gray-600 leading-relaxed">
                      AI menganalisis gaya belajar unik Anda dan menyesuaikan konten pembelajaran secara otomatis
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                    <Play className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Virtual Tutor 24/7</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Akses tutor AI kapan saja untuk menjawab pertanyaan dengan penjelasan yang mudah dipahami
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                    <Award className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Sertifikat Cepat & Akurat</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Dapatkan sertifikat yang diakui industri dengan pembelajaran yang efektif dan terstruktur
                    </p>
                  </div>
                </div>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 text-sm p-6 font-semibold shadow-lg hover:shadow-xl transition-all">
                Mulai Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Recommendations */}
     <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Rekomendasi untuk Pemula</h2>
          <p className="text-white/90 max-w-3xl mx-auto text-lg leading-relaxed">
            Setiap modul adalah bagian kecil dari topik besar, dirancang agar Anda bisa belajar sedikit demi sedikit,
            tapi tetap fokus dan mendalam.
          </p>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {modules.map((module) => (
            <div
              key={module.module_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Module Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={module.thumbnail || "/placeholder.svg"}
                  alt={module.module_title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Module Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-500 mb-2">{module.module_title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">{module.module_summary}</p>

                {/* Duration */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{module.total_duration_minutes} Menit</span>
                </div>

                {/* Learn Button */}
                <Button
                  onClick={() => handleModuleClick(module.module_id)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-medium"
                >
                  Belajar Modul
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button className="bg-white text-teal-600 hover:bg-gray-50 p-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            Lihat Semua Modul
          </Button>
        </div>
      </div>
    </section>

      {/* Alumni Stories */}

         <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Cerita Para Alumni</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Bagaimana LearnMate membantu mereka lulus lebih cepat, paham materi lebih dalam, dan percaya diri menghadapi
            dunia kerja.
          </p>
        </div>
             {/* First Row - Moving Right to Left */}
            <div className="relative mb-6">
              <div className="flex animate-marquee-left space-x-6">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex space-x-6">
                    {testimonials.map((t, i) => (
                      <div key={`${setIndex}-${i}`} className="flex-shrink-0 w-80 bg-white rounded-lg p-6 shadow-sm">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">{t.name}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {t.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Second Row - Moving Left to Right */}
            <div className="relative">
              <div className="flex animate-marquee-right space-x-6">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex space-x-6">
                    {testimonials.map((t, i) => (
                      <div key={`${setIndex}-${i}`} className="flex-shrink-0 w-80 bg-white rounded-lg p-6 shadow-sm">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">{t.name}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {t.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
      </div>
    </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-teal-600 text-white px-2 py-1 rounded font-bold text-lg">LM</div>
                <span className="font-semibold">Your Smart Learning Mate</span>
              </div>
              <p className="text-gray-400 text-sm">Copyright by LearnAI. All rights reserved.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    LearnCore
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Chatbot
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Timer
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Karier Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Terms & Policies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Syarat dan Ketentuan
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
