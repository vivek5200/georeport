"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import { Bell, Calendar, User, Plus, Megaphone } from "lucide-react"

function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/announcements`)
      setAnnouncements(response.data.data)
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Important updates and notifications</p>
        </div>
        {(user?.role === "admin" || user?.role === "authority") && (
          <Link to="/announcements/create" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create Announcement</span>
          </Link>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{announcement.message}</p>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                    {announcement.authority && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>By Authority</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Official</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {announcements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">There are no announcements available at this time.</p>
          {(user?.role === "admin" || user?.role === "authority") && (
            <div className="mt-6">
              <Link to="/announcements/create" className="btn-primary">
                Create First Announcement
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnnouncementsList
