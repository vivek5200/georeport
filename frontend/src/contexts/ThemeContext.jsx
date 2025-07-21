"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme")
      if (stored) {
        return stored === "dark"
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  useEffect(() => {
    const root = window.document.documentElement

    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
      // Set CSS custom properties for toast styling
      root.style.setProperty("--toast-bg", "#1f2937")
      root.style.setProperty("--toast-color", "#f9fafb")
      root.style.setProperty("--toast-border", "#374151")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
      // Set CSS custom properties for toast styling
      root.style.setProperty("--toast-bg", "#ffffff")
      root.style.setProperty("--toast-color", "#111827")
      root.style.setProperty("--toast-border", "#e5e7eb")
    }
  }, [isDark])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const value = {
    isDark,
    toggleTheme,
    setTheme: (theme) => {
      setIsDark(theme === "dark")
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
