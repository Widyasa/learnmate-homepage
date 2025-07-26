"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Send, Loader2, X, FileText, Brain, Bot } from "lucide-react"

// Import Supabase client
import { supabase } from "@/lib/supabase"

// Import Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai"

// Interface untuk data sub-modul
interface SubModuleData {
  id: number
  slug: string
  title: string
  description: string
  youtube_url: string
  objectives: string
  requirements: string
  learning_resources: { label: string; url: string }[]
  self_learning: { explanation: string; url: string }[]
  sub_module_materials: string
}

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// Inisialisasi Gemini AI - CLIENT SIDE
// PERINGATAN: Mengekspos API key di client-side berisiko. Gunakan backend untuk produksi.
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API || "")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// Fungsi untuk mengekstrak YouTube Video ID dari URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1)
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v")
    }
  } catch (e) {
    console.error("Invalid URL for YouTube", e)
  }
  return null
}

// Fungsi untuk mem-parsing teks dengan format bold (**text**)
const parseFormattedText = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g) // Split by **bolded** text
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part.split('\n').map((line, lineIndex) => (
      <span key={`${index}-${lineIndex}`}>{line}{lineIndex < part.split('\n').length - 1 && <br />}</span>
    ));
  })
}

export default function SubModulePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [subModule, setSubModule] = useState<SubModuleData | null>(null)

  // AI Assistant states
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isAILoading, setIsAILoading] = useState(false)

  // Collapsible states
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [selfLearningOpen, setSelfLearningOpen] = useState(false)
  const [objectivesOpen, setObjectivesOpen] = useState(false)
  const [subModulesMaterial, setSubModulesMaterial] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const submoduleId = params.submoduleId as string

  useEffect(() => {
    const fetchSubModuleData = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("sub_modules")
        .select("*")
        .eq("slug", submoduleId)
        .single()

      if (error || !data) {
        console.error("Error fetching submodule:", error)
        router.push("/learning-modules")
        return
      }

      setSubModule(data)

      // Initialize AI Assistant
      const welcomeMessage: Message = {
        id: Date.now(),
        text: `Halo! Saya adalah AI Assistant yang siap membantu Anda dengan materi **${data.title}**. Silakan ajukan pertanyaan apa pun terkait sub-modul ini.`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      setIsLoading(false)
    }

    const loginStatus = localStorage.getItem("isLoggedIn")
    if (loginStatus !== "true") {
      router.push("/login")
      return
    }

    if (submoduleId) {
        fetchSubModuleData()
    }
  }, [router, submoduleId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --- FUNGSI AI ASSISTANT ---
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isAILoading || !subModule) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsAILoading(true)

    // Membuat konteks untuk AI berdasarkan data sub-modul
    const context = `
        Judul Sub-Modul: ${subModule.title}
        Deskripsi: ${subModule.description}
        Tujuan Pembelajaran (Objectives): ${subModule.objectives}
        Prasyarat (Requirements): ${subModule.requirements}
        Sumber Belajar Tambahan: ${JSON.stringify(subModule.learning_resources)}
        Tips Self-Learning: ${JSON.stringify(subModule.self_learning)}
        Materi Bacaan Utama: ${subModule.sub_module_materials.replace(/<[^>]*>/g, '').substring(0, 1000)}...
    `

    // Membuat riwayat percakapan untuk dikirim ke AI
    const chatHistory = messages
      .map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n")

    // Membuat prompt lengkap
    const prompt = `
        Anda adalah AI Learning Assistant yang sangat membantu dan berpengetahuan luas untuk platform LearnMate.

        KONTEKS PEMBELAJARAN SAAT INI:
        ${context}

        RIWAYAT PERCAKAPAN SEBELUMNYA:
        ${chatHistory}

        PERTANYAAN TERBARU DARI PENGGUNA:
        ${userMessage.text}

        INSTRUKSI:
        1. Jawab pertanyaan pengguna secara spesifik berdasarkan **KONTEKS PEMBELAJARAN** yang diberikan.
        2. Jika pertanyaan di luar konteks, beritahu pengguna bahwa Anda hanya bisa menjawab pertanyaan seputar materi "${subModule.title}".
        3. Gunakan bahasa Indonesia yang natural, ramah, dan mudah dimengerti.
        4. Jika relevan, berikan contoh kode dalam blok markdown.
        5. Berikan jawaban yang ringkas dan padat (maksimal 150 kata).
        6. Gunakan format **teks tebal** untuk menekankan poin penting.
    `

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const aiResponseText = response.text()

      const botMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Maaf, terjadi kesalahan saat mencoba merespons. Silakan coba lagi nanti.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAILoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading || !subModule) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const videoId = getYouTubeVideoId(subModule.youtube_url)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
            <Link href="/learning-modules" className="text-lg font-semibold text-teal-700">
                &larr; Kembali ke Modul
            </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Video Player and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* YouTube Player */}
            <div className="aspect-video overflow-hidden rounded-lg bg-gray-200 shadow-md">
              {videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={subModule.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-300">
                  <p className="text-gray-600">Link video tidak valid.</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">{subModule.title}</h1>
              <p className="text-gray-600">{subModule.description}</p>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-4">
              {/* Objectives */}
              <Collapsible open={objectivesOpen} onOpenChange={setObjectivesOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Objective</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${objectivesOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="prose max-w-none rounded-lg border border-gray-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: subModule.objectives }} />
                </CollapsibleContent>
              </Collapsible>

              {/* Requirements */}
              <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Requirements</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${requirementsOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                    <div className="prose max-w-none rounded-lg border border-gray-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: subModule.requirements }} />
                </CollapsibleContent>
              </Collapsible>

              {/* Self Learning */}
              <Collapsible open={selfLearningOpen} onOpenChange={setSelfLearningOpen}>
                 <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                   <span className="font-medium text-gray-800">Self Learning Tips</span>
                   <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${selfLearningOpen ? "rotate-180" : ""}`} />
                 </CollapsibleTrigger>
                 <CollapsibleContent className="mt-2">
                   <div className="rounded-lg border border-gray-200 bg-white p-4">
                     <ul className="space-y-3">
                       {subModule.self_learning.map((tip, index) => (
                         <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                           <Brain className="h-4 w-4 flex-shrink-0 text-teal-600 mt-0.5" />
                           <a href={tip.url} target="_blank" rel="noopener noreferrer" className="hover:text-teal-700 hover:underline">
                             {tip.explanation}
                           </a>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </CollapsibleContent>
              </Collapsible>

              {/* Learning Resources */}
              <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
                 <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                   <span className="font-medium text-gray-800">Learning Resources</span>
                   <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
                 </CollapsibleTrigger>
                 <CollapsibleContent className="mt-2">
                   <div className="rounded-lg border border-gray-200 bg-white p-4">
                     <ul className="space-y-3">
                       {subModule.learning_resources.map((resource, index) => (
                         <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                           <FileText className="h-4 w-4 flex-shrink-0 text-teal-600 mt-0.5" />
                           <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                             {resource.label}
                           </a>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </CollapsibleContent>
               </Collapsible>

              {/* Materi Bacaan */}
              <Collapsible open={subModulesMaterial} onOpenChange={setSubModulesMaterial}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Materi Bacaan</span>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${subModulesMaterial ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="prose max-w-none rounded-lg border border-gray-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: subModule.sub_module_materials }} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Right Side - AI Assistant */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
            <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-md">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 p-4">
                <Bot className="h-6 w-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
              </div>

              {/* Messages Area */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm">{parseFormattedText(msg.text)}</p>
                    </div>
                  </div>
                ))}
                {isAILoading && (
                  <div className="flex justify-start gap-3">
                     <div className="max-w-[80%] rounded-xl bg-gray-100 px-4 py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanya tentang materi ini..."
                    className="pr-12"
                    disabled={isAILoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={handleSendMessage}
                    disabled={isAILoading || !inputMessage.trim()}
                  >
                    {isAILoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}