"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, SkipForward, RotateCcw, X, Menu } from "lucide-react"

interface TimerSettings {
  studyDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  rounds: number
}

type SessionType = "study" | "shortBreak" | "longBreak"

const STORAGE_KEYS = {
  login: "isLoggedIn",
  settings: "pomodoro:settings",
  state: "pomodoro:state",
}

export default function TimerPage() {
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [settings, setSettings] = useState<TimerSettings>({
    studyDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    rounds: 4,
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState(1)
  const [sessionType, setSessionType] = useState<SessionType>("study")
  const [timeLeft, setTimeLeft] = useState(0) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isSetup, setIsSetup] = useState(false)

  const tickRef = useRef<NodeJS.Timeout | null>(null)

  // ----- Helpers -----
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    }
  }

  const getCurrentSessionDuration = useMemo(() => {
    switch (sessionType) {
      case "study":
        return settings.studyDuration * 60
      case "shortBreak":
        return settings.shortBreakDuration * 60
      case "longBreak":
        return settings.longBreakDuration * 60
      default:
        return settings.studyDuration * 60
    }
  }, [sessionType, settings])

  const progress = useMemo(() => {
    if (!isSetup || getCurrentSessionDuration === 0) return 0
    const elapsed = getCurrentSessionDuration - timeLeft
    return Math.min(1, Math.max(0, elapsed / getCurrentSessionDuration))
  }, [getCurrentSessionDuration, isSetup, timeLeft])

  // ----- Auth check + load localStorage -----
  useEffect(() => {
    const loginStatus = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.login) : null
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)

    // Load settings from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings)
      if (raw) {
        const parsed = JSON.parse(raw) as TimerSettings
        setSettings(parsed)
      }
    } catch (e) {
      console.warn("Failed to parse pomodoro settings from localStorage", e)
    }

    // Load last running state (optional)
    try {
      const rawState = localStorage.getItem(STORAGE_KEYS.state)
      if (rawState) {
        const parsed = JSON.parse(rawState) as {
          currentSession: number
          sessionType: SessionType
          timeLeft: number
          isSetup: boolean
          isRunning: boolean
        }
        setCurrentSession(parsed.currentSession)
        setSessionType(parsed.sessionType)
        setTimeLeft(parsed.timeLeft)
        setIsSetup(parsed.isSetup)
        setIsRunning(false) // always pause when reload (safer UX)
      } else {
        // default first setup value
        setTimeLeft(settings.studyDuration * 60)
      }
    } catch (e) {
      console.warn("Failed to parse pomodoro state from localStorage", e)
    }

    setIsLoading(false)
  }, [router])

  // ----- Persist settings whenever it changes -----
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  }, [settings])

  // ----- Persist timer state -----
  useEffect(() => {
    if (typeof window === "undefined") return
    const state = {
      currentSession,
      sessionType,
      timeLeft,
      isSetup,
      isRunning,
    }
    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state))
  }, [currentSession, sessionType, timeLeft, isSetup, isRunning])

  // ----- Countdown effect -----
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      tickRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(tickRef.current as NodeJS.Timeout)
            setIsRunning(false)
            setTimeout(() => handleNext(), 250)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [isRunning, timeLeft])

  // ----- Keyboard shortcuts -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in input
      const t = e.target as HTMLElement
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.getAttribute("contenteditable") === "true")) {
        return
      }

      if (e.code === "Space" || e.key.toLowerCase() === "p") {
        e.preventDefault()
        handleStart()
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault()
        handleRestart()
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isSetup, isRunning, timeLeft, getCurrentSessionDuration])

  // ----- Actions -----
  const handleLogout = () => {
    localStorage.setItem(STORAGE_KEYS.login, "false")
    setIsLoggedIn(false)
    setIsSetup(false)
    setIsRunning(false)
    setTimeLeft(0)
    setCurrentSession(1)
    setSessionType("study")
    window.location.href = "/"
  }

  const handleSetup = () => {
    setIsSetup(true)
    setCurrentSession(1)
    setSessionType("study")
    setTimeLeft(settings.studyDuration * 60)
    setIsRunning(false)
  }

  const handleStart = () => {
    if (!isSetup) {
      handleSetup()
    }
    setIsRunning((p) => !p)
  }

  const handleRestart = () => {
    setTimeLeft(getCurrentSessionDuration)
    setIsRunning(false)
  }

  const handleNext = () => {
    if (sessionType === "study") {
      // selesai study -> break
      if (currentSession % 4 === 0) {
        setSessionType("longBreak")
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setSessionType("shortBreak")
        setTimeLeft(settings.shortBreakDuration * 60)
      }
    } else {
      // selesai break -> kembali ke study berikutnya
      if (currentSession < settings.rounds) {
        setCurrentSession((s) => s + 1)
        setSessionType("study")
        setTimeLeft(settings.studyDuration * 60)
      } else {
        alert("All sessions completed! Great job!")
        setIsSetup(false)
        setCurrentSession(1)
        setSessionType("study")
        setTimeLeft(0)
      }
    }
    setIsRunning(false)
  }

  const handleSettingChange = (field: keyof TimerSettings, value: string) => {
    const numValue = value === "" ? 0 : Number.parseInt(value.replace(/\D/g, "")) || 0
    setSettings((prev) => ({ ...prev, [field]: numValue }))
  }

  const applyPreset = (preset: TimerSettings) => {
    setSettings(preset)
    // kalau sudah jalan, reset agar sesuai config baru
    if (isSetup) {
      setIsSetup(false)
      setIsRunning(false)
      setCurrentSession(1)
      setSessionType("study")
      setTimeLeft(preset.studyDuration * 60)
    }
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

  const time = formatTime(timeLeft)
  const sessionTypeText =
    sessionType === "study" ? "Study" : sessionType === "shortBreak" ? "Short Break" : "Long Break"

  const progressDeg = progress * 360

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-teal-50">
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
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg "
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
              className="text-teal-600  border-b-2 border-teal-600 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg"
            >
              Timer
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 ">
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
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-200px)]">
          {/* Left */}
          <div className="lg:w-1/4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Pomodoro</h1>
            {isSetup && (
              <div className="text-lg text-gray-600 space-y-1">
                <p className="mb-1">Current Session:</p>
                <p className="font-semibold text-teal-600">{sessionTypeText}</p>
                <p className="text-sm text-gray-500">
                  Round {currentSession} of {settings.rounds}
                </p>
              </div>
            )}

            {/* Presets */}
            <div className="mt-8 space-y-2">
              <p className="text-sm text-gray-500 font-medium">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    applyPreset({ studyDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, rounds: 4 })
                  }
                >
                  25 / 5 / 15 × 4
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    applyPreset({ studyDuration: 50, shortBreakDuration: 10, longBreakDuration: 20, rounds: 4 })
                  }
                >
                  50 / 10 / 20 × 4
                </Button>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="mt-8 rounded-lg bg-white p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Keyboard Shortcuts</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Space</span> / <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">P</span> – Start/Pause</li>
                <li><span className="font-mono bg-gray-100 px-1 py-0.5 rounded">R</span> – Restart</li>
                <li><span className="font-mono bg-gray-100 px-1 py-0.5 rounded">N</span> – Next</li>
              </ul>
            </div>
          </div>

          {/* Center */}
          <div className="lg:w-1/2 flex flex-col items-center justify-center py-8">
            {/* Progress Ring */}
            <div
              className="relative w-[320px] h-[320px] rounded-full grid place-content-center shadow-xl"
              style={{
                background: `conic-gradient(#14b8a6 ${progressDeg}deg, #e5e7eb ${progressDeg}deg)`,
              }}
            >
              <div className="absolute inset-[20px] bg-white rounded-full shadow-inner flex flex-col items-center justify-center">
                <div className="flex justify-center gap-16 mb-2 text-gray-400 text-xs tracking-widest">
                  <span>HOURS</span>
                  <span>MIN</span>
                  <span>SEC</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-6xl md:text-7xl font-bold text-gray-800 font-mono">{time.hours}</span>
                  <span className="text-5xl font-bold text-gray-400">:</span>
                  <span className="text-6xl md:text-7xl font-bold text-gray-800 font-mono">{time.minutes}</span>
                  <span className="text-5xl font-bold text-gray-400">:</span>
                  <span className="text-6xl md:text-7xl font-bold text-gray-800 font-mono">{time.seconds}</span>
                </div>

                <p className="mt-4 text-sm text-gray-500 font-medium">{sessionTypeText}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 flex-wrap justify-center">
              <div className="flex justify-center items-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    disabled={!isSetup}
                    className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-base"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Restart
                  </Button>

                  <Button
                    onClick={handleStart}
                    className="px-10 py-3 bg-teal-600 hover:bg-teal-700 text-white text-base"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" /> Start
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={!isSetup}
                    className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-base"
                  >
                    Next <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
              </div>

              <span className="ml-2 text-gray-600 font-medium text-base">
                {currentSession} of {settings.rounds} Sessions
              </span>
            </div>
          </div>

          {/* Right - Settings */}
          <div className="lg:w-1/4 space-y-8">
            <div>
              <p className="text-gray-700 font-medium mb-2">Study Duration (minutes)</p>
              <Input
                type="number"
                min="1"
                max="120"
                value={settings.studyDuration}
                onChange={(e) => handleSettingChange("studyDuration", e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault()
                }}
                className="w-full px-4 py-3 bg-white rounded-lg text-center text-lg font-medium focus:bg-white border border-gray-200 focus:ring-2 focus:ring-teal-500"
                placeholder="25"
              />
            </div>

            <div>
              <p className="text-gray-700 font-medium mb-2">Short Break (minutes)</p>
              <Input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => handleSettingChange("shortBreakDuration", e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault()
                }}
                className="w-full px-4 py-3 bg-white rounded-lg text-center text-lg font-medium focus:bg-white border border-gray-200 focus:ring-2 focus:ring-teal-500"
                placeholder="5"
              />
            </div>

            <div>
              <p className="text-gray-700 font-medium mb-2">Long Break (minutes)</p>
              <Input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => handleSettingChange("longBreakDuration", e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault()
                }}
                className="w-full px-4 py-3 bg-white rounded-lg text-center text-lg font-medium focus:bg-white border border-gray-200 focus:ring-2 focus:ring-teal-500"
                placeholder="15"
              />
            </div>

            <div>
              <p className="text-gray-700 font-medium mb-2">Rounds</p>
              <Input
                type="number"
                min="1"
                max="10"
                value={settings.rounds}
                onChange={(e) => handleSettingChange("rounds", e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault()
                }}
                className="w-full px-4 py-3 bg-white rounded-lg text-center text-lg font-medium focus:bg-white border border-gray-200 focus:ring-2 focus:ring-teal-500"
                placeholder="4"
              />
            </div>

            <Button
              onClick={handleSetup}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-lg font-medium text-lg mt-4"
            >
              Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
