"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, ArrowRight, Lock, X, Menu } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"

interface SubModule {
  id: number
  order?: number
  title: string
  status?: "completed" | "available" | "locked"
}

interface ModuleData {
  id: string
  title: string
  subtitle: string
  image: string
  logoOverlay?: string
  duration: string
  thumbnail: string
  sub_modules: SubModule[]
  summary: string
  learning_benefits: string
  total_duration_minutes?: number
}

const CHECKED_KEY = "checkedSubModules"

function getCheckedSubModules(moduleId: string): number[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(`${CHECKED_KEY}_${moduleId}`)
  return data ? JSON.parse(data) : []
}

function setCheckedSubModules(moduleId: string, checked: number[]) {
  localStorage.setItem(`${CHECKED_KEY}_${moduleId}`, JSON.stringify(checked))
}

function getUpdatedSubModules(subModules: SubModule[], checked: number[]): SubModule[] {
  return subModules.map((subModule, index) => {
    if (checked.includes(subModule.id)) {
      return { ...subModule, status: "completed" }
    }
    const isPreviousCompleted =
      index === 0 || checked.includes(subModules[index - 1].id)
    return {
      ...subModule,
      status: isPreviousCompleted ? "available" : "locked"
    }
  })
}

export default function ModuleDetailPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [module, setModule] = useState<ModuleData | null>(null)
  const [checkedSubModules, setCheckedSubModulesState] = useState<number[]>([])
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    if (loginStatus !== "true") {
      router.push("/login")
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  useEffect(() => {
    if (!params.id) return
    let isMounted = true
    setIsLoading(true)

    supabaseClient
      .rpc("get_module_with_submodules", { module_id_input: params.id })
      .then(({ data, error }) => {
        if (isMounted) {
          if (!error && data) {
            setModule(data[0].module_data)
          }
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [params.id])

  useEffect(() => {
    if (moduleId) {
      setCheckedSubModulesState(getCheckedSubModules(moduleId))
    }
  }, [moduleId])

  const handleLogout = () => {
    localStorage.clear()
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

  const handleSubModuleClick = (subModule: SubModule) => {
    if (subModule.status === "locked") {
      alert("Anda harus menyelesaikan sub-modul sebelumnya terlebih dahulu!")
      return
    }


    if (!checkedSubModules.includes(subModule.id)) {
      const updated = [...checkedSubModules, subModule.id]
      setCheckedSubModulesState(updated)
      setCheckedSubModules(moduleId, updated)
    }

    router.push(`/submodule/${moduleId}/${subModule.slug}`)
  }

  const getSubModuleIcon = (subModule: SubModule) => {
    if (subModule.status === "completed") {
      return <CheckCircle className="w-5 h-5 text-white" />
    }
    if (subModule.status === "locked") {
      return <Lock className="w-5 h-5 text-white" />
    }
    return <ArrowRight className="w-5 h-5 text-white" />
  }

  const getSubModuleButtonClass = (subModule: SubModule) => {
    if (subModule.status === "completed") {
      return "bg-blue-600 hover:bg-blue-700"
    }
    if (subModule.status === "locked") {
      return "bg-gray-400 cursor-not-allowed"
    }
    return "bg-teal-600 hover:bg-teal-700"
  }

  if (isLoading || !module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const updatedSubModules = getUpdatedSubModules(module.sub_modules, checkedSubModules)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
             <header className="border-b border-gray-100 px-4 py-5 fixed w-full top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="images/logo/png" alt="" className=""/>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className=" hover:text-teal-600 font-medium transition-colors text-lg ">
              Home
            </Link>
            <button
              onClick={() => handleProtectedRoute("/learncore")}
              className="hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg text-teal-600  border-b-2 border-teal-600"
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

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{module.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{module.subtitle}</p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-teal-600 border-teal-600">
              Tersedia {module.sub_modules.length} Sub Modul
            </Badge>
            <Badge variant="outline" className="text-teal-600 border-teal-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {module.total_duration_minutes} Menit Belajar
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
              <img src={module.thumbnail || "/placeholder.svg"} alt={module.title} className="object-cover w-full h-full" />
              {module.logoOverlay && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center text-8xl">
                  {module.logoOverlay}
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <p className="text-gray-600 text-sm">{module.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Learning Benefit</h3>
                <div className="html-content" dangerouslySetInnerHTML={{ __html: module.learning_benefits }} />
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Sub Modul</h2>
            <div className="space-y-3">
              {updatedSubModules.map((subModule) => (
                <div key={subModule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="text-gray-700 font-medium">
                    {subModule.order ? `${subModule.order}. ` : ""}{subModule.title}
                  </span>
                  <Button
                    onClick={() => handleSubModuleClick(subModule)}
                    className={`px-4 py-2 rounded-lg ${getSubModuleButtonClass(subModule)}`}
                    disabled={subModule.status === "locked"}
                  >
                    {getSubModuleIcon(subModule)}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-teal-600 text-white px-2 py-1 rounded font-bold text-lg">LM</div>
              <div>
                <div className="font-semibold">Your Smart</div>
                <div className="font-semibold">Learning Mate</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Copyright by AvaraAI. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/learning-modules" className="hover:text-white">Learncore</Link></li>
              <li><button onClick={() => handleProtectedRoute("/chatbot")} className="hover:text-white">Chatbot</button></li>
              <li><button onClick={() => handleProtectedRoute("/timer")} className="hover:text-white">Timer</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Kontak Kami</a></li>
              <li><a href="#" className="hover:text-white">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white">Testimoni</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
