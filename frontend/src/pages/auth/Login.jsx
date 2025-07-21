"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Mail, Lock, MapPin, Eye, EyeOff } from "lucide-react"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
              <MapPin className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your GeoReport account</p>
        </div>

        {/* Login Form Card */}
        <div className="card card-hover">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field pl-10 focus-ring"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="input-field pl-10 pr-10 focus-ring"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm bg-white dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200 focus-ring"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Why choose GeoReport?</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-2 mx-auto w-fit">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Location-based reporting</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mb-2 mx-auto w-fit">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Real-time tracking</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-2 mx-auto w-fit">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Secure & private</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
