"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LearnCorePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Always redirect to login first - user must login to access learncore
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    const loggedIn = loginStatus === "true"

    if (!loggedIn) {
      router.push("/login")
      return
    }

    // Redirect to learning modules page
    router.push("/learning-modules")
  }, [router])

  // Handle logout
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    router.push("/")
  }

  // Handle protected route clicks
  const handleProtectedRoute = (route: string) => {
    if (isLoggedIn) {
      router.push(route)
    } else {
      router.push("/login")
    }
  }

  // Remove the main content section and just show loading
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  )
}
