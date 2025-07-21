"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Shield } from "lucide-react"

function OTPVerification() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, verifyOTP } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await verifyOTP(user?.email, otp)

    if (result.success) {
      navigate("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to <strong>{user?.email}</strong>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              required
              className="mt-1 input-field text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-500"
              onClick={() => {
                // Implement resend OTP functionality
                console.log("Resend OTP")
              }}
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OTPVerification
