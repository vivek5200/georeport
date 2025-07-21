"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import MapComponent from "../../components/MapComponent"
import { User, Mail, Phone, Lock, MapPin, Map, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "citizen",
    location: null,
    region: null,
  })
  const [loading, setLoading] = useState(false)
  const [mapMode, setMapMode] = useState("location")
  const [currentLocation, setCurrentLocation] = useState(null)
  const [mapInstructions, setMapInstructions] = useState("Click on the map to select your location or use the button below to detect your current location.")
  const [geolocationError, setGeolocationError] = useState(null)
  const mapRef = useRef(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Set initial map mode based on role
    const mode = formData.role === "citizen" ? "location" : "region"
    setMapMode(mode)
    
    // Update instructions based on role
    if (formData.role === "citizen") {
      setMapInstructions("Click on the map to select your location or use the button below to detect your current location.")
    } else if (formData.role === "authority") {
      setMapInstructions("Click 'Draw Region' to start drawing your service area. Click to add points and double-click to finish.")
    }
  }, [formData.role])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (e) => {
    const role = e.target.value
    setFormData({
      ...formData,
      role,
      location: role === "citizen" ? formData.location : null,
      region: role === "authority" ? formData.region : null,
    })
  }

  const handleLocationSelect = (coordinates) => {
    if (formData.role === "citizen") {
      setFormData({
        ...formData,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
      })
      setCurrentLocation(coordinates)
    }
  }

  const handleRegionComplete = (polygonCoordinates) => {
    if (formData.role === "authority") {
      setFormData({
        ...formData,
        region: {
          type: "Polygon",
          coordinates: [polygonCoordinates],
        },
      })
    }
  }

  const clearDrawnRegion = () => {
    if (mapRef.current) {
      mapRef.current.clearDrawings()
    }
    setFormData({
      ...formData,
      region: null,
    })
  }

  const detectCurrentLocation = () => {
    setGeolocationError(null)
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude]
          handleLocationSelect(coords)
          if (mapRef.current) {
            mapRef.current.flyTo(coords, 15)
          }
          toast.success("Location detected successfully!")
          setLoading(false)
        },
        (error) => {
          let errorMessage = "Error getting location"
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable location permissions."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "The request to get location timed out."
              break
            default:
              errorMessage = "An unknown error occurred."
          }
          setGeolocationError(errorMessage)
          toast.error(errorMessage)
          setLoading(false)
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setGeolocationError("Geolocation is not supported by your browser")
      toast.error("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.role === "citizen" && !formData.location) {
      toast.error("Please select your location on the map")
      return
    }

    if (formData.role === "authority" && !formData.region) {
      toast.error("Please draw your service region on the map")
      return
    }

    setLoading(true)

    const userData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      role: formData.role,
    }

    if (formData.role === "citizen") {
      userData.location = formData.location
    } else if (formData.role === "authority") {
      userData.region = formData.region
    }

    try {
      const result = await register(userData)
      if (result.success) {
        navigate("/verify-otp")
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <MapPin className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  value={formData.role}
                  onChange={handleRoleChange}
                >
                  <option value="citizen">Citizen</option>
                  <option value="authority">Authority</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {mapMode && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.role === "citizen" ? "Your Location" : "Service Region"}
                  </label>
                  {formData.role === "citizen" && (
                    <button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={loading}
                      className="text-sm flex items-center text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Map className="h-4 w-4 mr-1" />
                      Use Current Location
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3">{mapInstructions}</p>

                {geolocationError && (
                  <div className="flex items-center text-red-600 text-sm mb-3">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {geolocationError}
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <MapComponent
                    ref={mapRef}
                    center={currentLocation || [77.209, 28.6139]}
                    zoom={formData.role === "citizen" ? 15 : 10}
                    height="300px"
                    showLocationPicker={formData.role === "citizen"}
                    showDrawingTools={formData.role === "authority"}
                    onLocationSelect={handleLocationSelect}
                    onDrawingComplete={handleRegionComplete}
                    interactive={true}
                  />
                </div>

                {formData.role === "citizen" && formData.location && (
                  <p className="mt-2 text-sm text-green-600">
                    Location selected: {formData.location.coordinates[1].toFixed(4)},{" "}
                    {formData.location.coordinates[0].toFixed(4)}
                  </p>
                )}

                {formData.role === "authority" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => mapRef.current && mapRef.current.enableDrawing()}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Draw Region
                    </button>
                    <button
                      type="button"
                      onClick={clearDrawnRegion}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Clear Drawing
                    </button>
                  </div>
                )}

                {formData.role === "authority" && formData.region && (
                  <p className="mt-2 text-sm text-green-600">
                    Region selected with {formData.region.coordinates[0].length} boundary points
                  </p>
                )}
              </div>
            )}

            {formData.role === "authority" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Authority accounts require admin approval. You'll need to wait for approval
                  before accessing the system.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register