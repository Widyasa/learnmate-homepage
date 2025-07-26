"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Menu, X } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Inisialisasi Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function RegisterPage() {
  const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const handleProtectedRoute = (route: string) => {
  const currentLoginStatus = localStorage.getItem("isLoggedIn") === "true"
  if (currentLoginStatus) {
    router.push(route)
  } else {
    router.push("/login")
  }
}

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    agreeToTerms: "",
    submit: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeToTerms: checked,
    }))
    if (errors.agreeToTerms) {
      setErrors((prev) => ({
        ...prev,
        agreeToTerms: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      agreeToTerms: "",
      submit: "",
    }
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.name) {
      newErrors.name = "Name is required"
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and privacy policy"
    }
    setErrors(newErrors)
    return Object.values(newErrors).every((error) => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors((prev) => ({ ...prev, submit: "" }))
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // 1. Sign up user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })
      if (error) {
        setErrors((prev) => ({ ...prev, submit: error.message }))
        setIsLoading(false)
        return
      }
      const user = data.user
      if (!user) {
        setErrors((prev) => ({ ...prev, submit: "User creation failed." }))
        setIsLoading(false)
        return
      }

      // 2. Insert student data
      const { error: studentError } = await supabase.from("students").insert([
        {
          name: formData.name,
          user_id: user.id,
          role: "student",
        },
      ])
      if (studentError) {
        setErrors((prev) => ({ ...prev, submit: studentError.message }))
        setIsLoading(false)
        return
      }

      // 3. Redirect
      router.push("/quiz")
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err.message || "Registration failed." }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-4 py-4 fixed w-full top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="images/logo.png" alt="" className="" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
              Home
            </Link>
            <button
              onClick={() => handleProtectedRoute("/learncore")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors"
            >
              LearnCore
            </button>
            <button
              onClick={() => handleProtectedRoute("/chatbot")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors"
            >
              Chatbot
            </button>
            <button
              onClick={() => handleProtectedRoute("/timer")}
              className="text-gray-700 hover:text-teal-600 font-medium cursor-pointer transition-colors"
            >
              Timer
            </button>
          </nav>



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
          </div>
        )}
      </header>
      <div className="flex h-screen"
             style={{
             backgroundImage: "url('/images/bg.svg')",
             backgroundRepeat: "repeat",
             backgroundPosition: "center",
           }}>
        <div className="container mx-auto flex my-[150px] rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <img
              src="/images/auth-img.png"
              alt="Students studying together"
              className="hidden md:block w-1/2 h-full object-cover"
            />
          <div className="w-full bg-gray-50 flex justify-center items-center">
          <div className="w-full max-w-2xl space-y-6 p-10">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800 mb-2">Create Account</h1>
              <p className="text-gray-600">Create your account to start your learning path</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="sr-only">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                    errors.name ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                  }`}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                    errors.email ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                  }`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 pr-12 ${
                      errors.password ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="sr-only">Re-Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 pr-12 ${
                      errors.confirmPassword ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
        
              {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white p-6  rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500 font-medium">OR</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-800 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}