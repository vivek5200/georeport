"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import MapComponent from "../../components/MapComponent"
import { ArrowLeft, Megaphone, MapPin } from "lucide-react"

function CreateAnnouncement() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    area: null,
  })
  const [loading, setLoading] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLocationSelect = (coordinates) => {
    // For simplicity, we'll create a small polygon around the selected point
    // In a real application, you'd want a proper polygon drawing tool
    const offset = 0.01 // roughly 1km
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [coordinates[0] - offset, coordinates[1] - offset],
          [coordinates[0] + offset, coordinates[1] - offset],
          [coordinates[0] + offset, coordinates[1] + offset],
          [coordinates[0] - offset, coordinates[1] + offset],
          [coordinates[0] - offset, coordinates[1] - offset], // Close the polygon
        ],
      ],
    }

    setFormData({
      ...formData,
      area: polygon,
    })
    setSelectedCoordinates(coordinates)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (user?.role === "authority" && !formData.area) {
      toast.error("Please select an area for the announcement")
      return
    }

    setLoading(true)

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
      }

      // Only include area for authority users
      if (user?.role === "authority" && formData.area) {
        payload.area = formData.area
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/announcements`, payload)
      toast.success("Announcement created successfully!")
      navigate("/announcements")
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create announcement"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate("/announcements")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Announcement</h1>
          <p className="text-gray-600">
            {user?.role === "admin" ? "Create a system-wide announcement" : "Create an announcement for your area"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Megaphone className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Announcement Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="input-field"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="input-field"
                    placeholder="Enter your announcement message"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                {/* Role-specific information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Megaphone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {user?.role === "admin" ? "System-wide Announcement" : "Regional Announcement"}
                      </h4>
                      <p className="text-sm text-blue-800 mt-1">
                        {user?.role === "admin"
                          ? "This announcement will be visible to all users in the system."
                          : "This announcement will be visible to citizens in the selected area."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map (for authority users) */}
          {user?.role === "authority" && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Target Area</h3>
              </div>

              <div className="space-y-4">
                <MapComponent
                  center={[77.209, 28.6139]} // Default to Delhi
                  zoom={12}
                  height="400px"
                  showLocationPicker={true}
                  onLocationSelect={handleLocationSelect}
                />

                {selectedCoordinates.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Area selected around: {selectedCoordinates[1].toFixed(4)}, {selectedCoordinates[0].toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Note:</strong> Click on the map to select the center of your announcement area. A 1km radius
                    area will be automatically created around the selected point.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Admin info card */}
          {user?.role === "admin" && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Coverage</h3>
              </div>

              <div className="text-center py-8">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Megaphone className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">System-wide Coverage</h4>
                <p className="text-sm text-gray-600">
                  As an admin, your announcement will be visible to all users across the entire system.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/announcements")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Creating..." : "Create Announcement"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateAnnouncement
