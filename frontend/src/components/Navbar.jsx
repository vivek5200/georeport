"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Menu, X, MapPin, User, LogOut, Sun, Moon } from "lucide-react"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActivePath(to)
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
      } ${className}`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  )

  const ThemeToggle = ({ className = "" }) => (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )

  if (!isAuthenticated) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">GeoReport</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 animate-slide-up">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-gray-100">GeoReport</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            {user?.role === "citizen" && <NavLink to="/reports/create">Create Report</NavLink>}
            <NavLink to="/announcements">Announcements</NavLink>
            {(user?.role === "admin" || user?.role === "authority") && (
              <NavLink to="/announcements/create">Create Announcement</NavLink>
            )}
            {user?.role === "admin" && <NavLink to="/admin/requests">Authority Requests</NavLink>}

            <ThemeToggle className="ml-2" />

            {/* User Menu */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/dashboard" className="block">
                Dashboard
              </NavLink>
              <NavLink to="/reports" className="block">
                Reports
              </NavLink>
              {user?.role === "citizen" && (
                <NavLink to="/reports/create" className="block">
                  Create Report
                </NavLink>
              )}
              <NavLink to="/announcements" className="block">
                Announcements
              </NavLink>
              {(user?.role === "admin" || user?.role === "authority") && (
                <NavLink to="/announcements/create" className="block">
                  Create Announcement
                </NavLink>
              )}
              {user?.role === "admin" && (
                <NavLink to="/admin/requests" className="block">
                  Authority Requests
                </NavLink>
              )}

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
