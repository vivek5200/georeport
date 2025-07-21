"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"
import toast from "react-hot-toast"

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
      })

      newSocket.on("connect", () => {
        console.log("Connected to server")

        // Subscribe to user-specific events based on role
        if (user.role === "authority") {
          newSocket.emit("subscribeToAuthority", user.id)
        }
      })

      // Listen for real-time updates
      newSocket.on("reportStatusChanged", (data) => {
        toast.success(`Report status updated to: ${data.newStatus}`)
      })

      newSocket.on("workUpdate", (data) => {
        toast.info(`Work update: Report ${data.reportId} is now ${data.newStatus}`)
      })

      newSocket.on("reportUpdated", (data) => {
        // Handle admin dashboard updates
        console.log("Report updated:", data)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [isAuthenticated, user])

  const subscribeToReport = (reportId) => {
    if (socket) {
      socket.emit("subscribeToReport", reportId)
    }
  }

  const value = {
    socket,
    subscribeToReport,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
