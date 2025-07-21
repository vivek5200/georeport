"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-otp" replace />
  }

  if (user.role === "authority" && !user.isApproved) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
        <p className="text-gray-600">
          Your authority account is pending admin approval. Please wait for approval to access the system.
        </p>
      </div>
    )
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
