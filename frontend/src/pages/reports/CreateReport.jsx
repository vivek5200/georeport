"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import MapComponent from "../../components/MapComponent"
import { Camera, MapPin } from "lucide-react"

function CreateReport() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pothole",
    severity: 3,
    location: null,
    photoUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const navigate = useNavigate()

  const categories = [
    { value: "pothole", label: "Pothole" },
    { value: "garbage", label: "Garbage" },
    { value: "waterlogging", label: "Waterlogging" },
    { value: "streetlight", label: "Street Light" },
    { value: "other", label: "Other" },
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLocationSelect = (coordinates) => {
    setFormData({
      ...formData,
      location: {
        type: "Point",
        coordinates: coordinates,
      },
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        // For demo purposes, we'll use the base64 string as photoUrl
        // In production, you'd upload to a file storage service
        setFormData({
          ...formData,
          photoUrl: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.location) {
      toast.error("Please select a location on the map")
      return
    }

    if (!formData.photoUrl) {
      toast.error("Please upload a photo")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reports`, formData)
      toast.success("Report created successfully!")
      navigate("/reports")
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create report"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Report</h1>
        <p className="text-gray-600">Report an issue in your area</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>

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
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="input-field"
                    placeholder="Detailed description of the issue"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="input-field"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity (1-5) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      id="severity"
                      name="severity"
                      min="1"
                      max="5"
                      className="flex-1"
                      value={formData.severity}
                      onChange={handleChange}
                    />
                    <span className="text-lg font-semibold text-primary-600">{formData.severity}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Evidence</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo *</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="space-y-4">
              <MapComponent
                center={[77.209, 28.6139]} // Default to Delhi
                zoom={12}
                height="400px"
                showLocationPicker={true}
                onLocationSelect={handleLocationSelect}
              />

              {formData.location && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Location selected: {formData.location.coordinates[1].toFixed(4)},{" "}
                    {formData.location.coordinates[0].toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/reports")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Creating Report..." : "Create Report"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateReport
