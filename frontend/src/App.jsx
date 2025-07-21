"use client"

import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, AuthContext } from "./contexts/AuthContext"
import { SocketProvider } from "./contexts/SocketContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"

// Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import OTPVerification from "./pages/auth/OTPVerification"
import CitizenDashboard from "./pages/dashboard/CitizenDashboard"
import AuthorityDashboard from "./pages/dashboard/AuthorityDashboard"
import AdminDashboard from "./pages/dashboard/AdminDashboard"
import CreateReport from "./pages/reports/CreateReport"
import ReportsList from "./pages/reports/ReportsList"
import ReportDetails from "./pages/reports/ReportDetails"
import AnnouncementsList from "./pages/announcements/AnnouncementsList"
import CreateAnnouncement from "./pages/announcements/CreateAnnouncement"
import AuthorityRequests from "./pages/admin/AuthorityRequests"

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<OTPVerification />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <ReportsList />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/reports/create"
                    element={
                      <ProtectedRoute roles={["citizen"]}>
                        <CreateReport />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/reports/:id"
                    element={
                      <ProtectedRoute>
                        <ReportDetails />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/announcements"
                    element={
                      <ProtectedRoute>
                        <AnnouncementsList />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/announcements/create"
                    element={
                      <ProtectedRoute roles={["admin", "authority"]}>
                        <CreateAnnouncement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/requests"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AuthorityRequests />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  className:
                    "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !border !border-gray-200 dark:!border-gray-700",
                  duration: 4000,
                  style: {
                    background: "var(--toast-bg)",
                    color: "var(--toast-color)",
                    border: "1px solid var(--toast-border)",
                  },
                }}
              />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  )
}

// Dashboard Router Component
function DashboardRouter() {
  const { user } = React.useContext(AuthContext)

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case "citizen":
      return <CitizenDashboard />
    case "authority":
      return <AuthorityDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

export default App
