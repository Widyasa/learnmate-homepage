"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Send, Loader2, X, FileText, Brain } from "lucide-react"

// Import Supabase client
import { supabase } from "@/lib/supabase"

// Interface untuk data sub-modul
interface SubModuleData {
  id: number
  title: string
  description: string
  youtube_url: string
  requirements: string
  learning_resources: string[]
  self_learning: string[]
}

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// Fungsi untuk mengekstrak YouTube Video ID dari URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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

        console.log(data)

      if (error || !data) {
        console.error("Error fetching submodule:", error)
        router.push("/learning-modules")
        return
      }

      setSubModule({
        ...data,
      })


      // Initialize AI Assistant
      const welcomeMessage: Message = {
        id: 1,
        text: `Halo! Saya AI Assistant untuk sub-modul **${data.title}**. Apa yang bisa saya bantu?`,
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

    fetchSubModuleData()
  }, [router, submoduleId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  // ... (Fungsi AI Assistant seperti `handleSendMessage` tidak berubah)
  const handleSendMessage = async () => { /* ... */ };
  const parseFormattedText = (text: string) => { /* ... */ };
  const handleKeyPress = (e: React.KeyboardEvent) => { /* ... */ };


  if (isLoading || !subModule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  const videoId = getYouTubeVideoId(subModule.youtube_url);

  return (
    <div className="min-h-screen bg-white">
      {/* Header (tidak berubah) */}
      <header className="border-b border-gray-100 px-4 py-4">
        {/* ... Header JSX ... */}
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Video Player and Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* YouTube Player */}
            <div className="bg-gray-200 rounded-lg aspect-video overflow-hidden">
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
                 <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <p className="text-gray-600">Link video tidak valid.</p>
                 </div>
              )}
            </div>

            {/* Video Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{subModule.title}</h1>
              <p className="text-gray-600 mb-4">{subModule.description}</p>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-4">
              {/* Requirements */}
              <Collapsible open={objectivesOpen} onOpenChange={setObjectivesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Objective</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${objectivesOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="html-content" dangerouslySetInnerHTML={{ __html: subModule.objectives }} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

               <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Requirements</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${requirementsOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="html-content" dangerouslySetInnerHTML={{ __html: subModule.requirements }} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Learn Resources */}
              <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Learning Resources</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <ul className="space-y-2">
                      {subModule.self_learning.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Brain className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <a
                        href={tip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline"
                        >
                        {tip.explanation}
                        </a>
                    </li>
                    ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Self Learning */}
              <Collapsible open={selfLearningOpen} onOpenChange={setSelfLearningOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Self Learning</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${selfLearningOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 fbg-white border border-gray-200 rounded-lg">
                    <ul className="space-y-2">
                      {subModule.learning_resources.map((resource, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <FileText className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 hover:underline"
                          >
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Right Side - AI Assistant (tidak berubah) */}
          <div className="lg:col-span-1">
            {/* ... Kode AI Assistant ... */}
          </div>
        </div>
      </div>
    </div>
  )
}