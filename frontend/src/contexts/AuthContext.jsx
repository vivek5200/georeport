"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`
      localStorage.setItem("token", state.token)
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }, [state.token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`)
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: response.data.user, token },
          })
        } catch (error) {
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      })

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      })

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, userData)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      })

      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        email,
        otp,
      })

      dispatch({
        type: "UPDATE_USER",
        payload: response.data.user,
      })

      toast.success("Email verified successfully!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
    toast.success("Logged out successfully")
  }

  const value = {
    ...state,
    login,
    register,
    verifyOTP,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
