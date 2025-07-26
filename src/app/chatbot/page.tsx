"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Loader2, Copy, Check, Wifi, WifiOff, X, Menu } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isError?: boolean
  isFallback?: boolean
}

// Function to parse formatted text with bold and code blocks
const parseFormattedText = (text: string) => {
  // Split text by code blocks first
  const codeBlockRegex = /```([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      parts.push({ type: "text", content: beforeText })
    }

    // Add code block
    parts.push({ type: "code", content: match[1].trim() })
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) })
  }

  // If no code blocks found, treat entire text as regular text
  if (parts.length === 0) {
    parts.push({ type: "text", content: text })
  }

  return parts.map((part, index) => {
    if (part.type === "code") {
      return <CodeBlock key={index} code={part.content} />
    } else {
      // Parse bold text in regular text
      const boldRegex = /\*\*(.*?)\*\*/g
      const textParts = part.content.split(boldRegex)

      return (
        <span key={index}>
          {textParts.map((textPart, textIndex) => {
            // Odd indices are the content inside ** **
            if (textIndex % 2 === 1) {
              return (
                <strong key={textIndex} className="font-bold">
                  {textPart}
                </strong>
              )
            }
            return textPart
          })}
        </span>
      )
    }
  })
}

// Enhanced Code Block Component with Language Detection and Smart Copy
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  // Parse language and actual code content
  const parseCodeContent = (rawCode: string) => {
    const lines = rawCode.split("\n")
    const firstLine = lines[0].trim()

    // Common programming languages
    const languages = [
      "javascript",
      "js",
      "typescript",
      "ts",
      "python",
      "py",
      "java",
      "cpp",
      "c++",
      "c",
      "html",
      "css",
      "scss",
      "sass",
      "php",
      "ruby",
      "go",
      "rust",
      "kotlin",
      "swift",
      "sql",
      "bash",
      "shell",
      "json",
      "xml",
      "yaml",
      "yml",
      "markdown",
      "md",
      "react",
      "vue",
      "angular",
      "node",
      "nodejs",
      "express",
      "laravel",
      "django",
      "flask",
    ]

    // Check if first line is a language identifier
    const isLanguageLine = languages.some(
      (lang) =>
        firstLine.toLowerCase() === lang ||
        firstLine.toLowerCase().startsWith(lang + " ") ||
        firstLine.toLowerCase().endsWith("." + lang),
    )

    if (isLanguageLine && lines.length > 1) {
      return {
        language: firstLine,
        actualCode: lines.slice(1).join("\n").trim(),
      }
    }

    return {
      language: null,
      actualCode: rawCode.trim(),
    }
  }

  const { language, actualCode } = parseCodeContent(code)

  const handleCopy = async () => {
    try {
      // Only copy the actual code content, not the language identifier
      await navigator.clipboard.writeText(actualCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg my-2 overflow-hidden">
      {/* Language Badge */}
      {language && (
        <div className="absolute top-2 left-3 px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 select-none">
          {language}
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors z-10"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-600" />}
      </button>

      {/* Code Content */}
      <pre className={`p-3 pr-12 overflow-x-auto text-sm font-mono text-gray-800 ${language ? "pt-8" : ""}`}>
        <code>
          {language && <span className="text-gray-500 select-none block mb-1">{language}</span>}
          {actualCode}
        </code>
      </pre>
    </div>
  )
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya adalah AI Assistant LearnMate yang didukung oleh Gemini AI. Saya siap membantu Anda dengan pertanyaan seputar pembelajaran programming dan teknologi. Berdasarkan hasil kuis Anda, saya sudah memahami minat dan level Anda. Ada yang bisa saya bantu?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [showQuickQuestions, setShowQuickQuestions] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "fallback" | "error">("connected")
  const [retryCount, setRetryCount] = useState(0)
  const [userContext, setUserContext] = useState<{
    selectedTech: string
    aiAnalysis: string
    quizAnswers: any
  }>({
    selectedTech: "",
    aiAnalysis: "",
    quizAnswers: {},
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    // Load user context from localStorage
    const selectedTech = localStorage.getItem("selectedTech") || ""
    const aiAnalysis = localStorage.getItem("aiAnalysis") || ""
    const quizAnswers = JSON.parse(localStorage.getItem("quizAnswers") || "{}")

    setUserContext({ selectedTech, aiAnalysis, quizAnswers })
    setIsLoggedIn(true)
    setIsPageLoading(false)
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
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

  const generateAIResponse = async (
    userMessage: string,
  ): Promise<{ response: string; isFallback: boolean; isError: boolean }> => {
    try {
      setConnectionStatus("connected")
      setRetryCount(0)

      console.log("Sending request to AI API...")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: userContext,
          chatHistory: messages.slice(-3), // Reduced to last 3 messages
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("API Response received:", data.fallback ? "fallback" : "normal")

        // Check response type
        if (data.error) {
          setConnectionStatus("error")
          return { response: data.response, isFallback: false, isError: true }
        } else if (data.fallback) {
          setConnectionStatus("fallback")
          return { response: data.response, isFallback: true, isError: false }
        } else {
          setConnectionStatus("connected")
          return { response: data.response, isFallback: false, isError: false }
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error("Error getting AI response:", error)
      setConnectionStatus("error")
      setRetryCount((prev) => prev + 1)

      return {
        response: `**Koneksi Bermasalah** ⚠️

Maaf, saya tidak dapat terhubung ke server AI saat ini. 

**Saran:**
1. **Coba lagi** dalam beberapa detik
2. **Gunakan pertanyaan cepat** di bawah
3. **Refresh halaman** jika masalah berlanjut

**Quick tip sementara:**
\`\`\`javascript
// Tetap semangat belajar!
const mindset = "challenges are opportunities";
console.log("Keep coding:", mindset);
\`\`\`

Sistem akan segera normal kembali! 🚀`,
        isFallback: false,
        isError: true,
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)
    setShowQuickQuestions(false)

    try {
      const { response, isFallback, isError } = await generateAIResponse(currentMessage)

      const botResponse: Message = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        timestamp: new Date(),
        isError,
        isFallback,
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Critical error in handleSendMessage:", error)

      const errorResponse: Message = {
        id: messages.length + 2,
        text: "Terjadi kesalahan sistem. Silakan refresh halaman dan coba lagi.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorResponse])
      setConnectionStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
    setShowQuickQuestions(false)
  }

  const quickQuestions = [
    `Bagaimana cara mulai belajar ${userContext.selectedTech}?`,
    "Apa roadmap pembelajaran yang tepat?",
    "Rekomendasi project untuk pemula?",
    "Tips mengatasi kesulitan belajar?",
    "Bagaimana cara debugging code?",
    "Apa framework yang harus dipelajari?",
  ]

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              className="text-teal-600  border-b-2 border-teal-600 hover:text-teal-600 font-medium cursor-pointer transition-colors text-lg"
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
                    className="text-[16px] py-6 px-8 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent transition-colors"
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

      {/* Enhanced Connection Status */}
      {connectionStatus !== "connected" && (
        <div
          className={`px-4 py-3 text-center mt-20 text-sm ${
            connectionStatus === "fallback"
              ? "bg-yellow-50 text-yellow-800 border-b border-yellow-200"
              : "bg-red-50 text-red-800 border-b border-red-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {connectionStatus === "fallback" ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>AI sedang sibuk - menggunakan respons cerdas yang tetap membantu!</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Koneksi AI terganggu - silakan coba lagi atau gunakan pertanyaan cepat</span>
                {retryCount > 0 && <span className="ml-2 text-xs">({retryCount} attempts)</span>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32 mt-20">
        <div className="container mx-auto max-w-4xl">
          {/* User Context Display */}
          {userContext.selectedTech && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-teal-600" />
                <span className="text-teal-800 font-medium text-sm">Konteks Pembelajaran Anda</span>
              </div>
              <p className="text-teal-700 text-sm">
                Minat: <span className="font-medium">{userContext.selectedTech}</span>
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={message.id}>
                {/* Show Chatbot label for first bot message or when switching from user to bot */}
                {message.sender === "bot" && (index === 0 || messages[index - 1]?.sender === "user") && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600 font-medium">AI Assistant</span>
                    <span className="text-xs text-gray-400">• Powered by Gemini</span>
                    {message.isFallback && <span className="text-xs text-yellow-600">• Smart Fallback</span>}
                    {message.isError && <span className="text-xs text-red-400">• Offline Mode</span>}
                  </div>
                )}

                <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-xl px-4 py-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-teal-600 text-white ml-auto"
                        : message.isError
                          ? "bg-red-50 text-gray-800 border border-red-200"
                          : message.isFallback
                            ? "bg-yellow-50 text-gray-800 border border-yellow-200"
                            : "text-gray-800"
                    }`}
                    style={{
                      backgroundColor:
                        message.sender === "bot" && !message.isError && !message.isFallback ? "#FFF4D5" : undefined,
                    }}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {parseFormattedText(message.text)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">AI Assistant</span>
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400">• Processing...</span>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl max-w-xs" style={{ backgroundColor: "#FFF4D5" }}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Floating Quick Questions */}
      {showQuickQuestions && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Pertanyaan Cepat:</p>
                <button onClick={() => setShowQuickQuestions(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs text-left justify-start h-auto py-2 px-3 hover:bg-teal-50 hover:border-teal-300"
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-[10000]">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start space-x-3">
            <Button
              onClick={() => setShowQuickQuestions(!showQuickQuestions)}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs hover:bg-teal-50 hover:border-teal-300"
              disabled={isLoading}
            >
              💡 Pertanyaan
            </Button>
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Saya Merasa Sulit Memahami Materi....."
                className="w-full pr-12 py-3 rounded border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 rounded-full w-8 h-8 p-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
