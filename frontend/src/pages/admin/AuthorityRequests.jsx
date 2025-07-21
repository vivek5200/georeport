"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar } from "lucide-react"

function AuthorityRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/requests`)
      setRequests(response.data.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load authority requests")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestUpdate = async (requestId, status) => {
    setUpdating({ ...updating, [requestId]: true })

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/requests/${requestId}`, {
        status,
      })

      // Update the request in the local state
      setRequests(requests.map((req) => (req._id === requestId ? { ...req, status } : req)))

      toast.success(`Request ${status} successfully!`)
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${status} request`
      toast.error(message)
    } finally {
      setUpdating({ ...updating, [requestId]: false })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Authority Requests</h1>
        <p className="text-gray-600">Review and manage authority registration requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((req) => req.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((req) => req.status === "approved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((req) => req.status === "rejected").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.user?.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.user?.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Region Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Assigned Region</h4>
                  <div className="text-sm text-gray-600">
                    <p>Type: {request.region?.type}</p>
                    <p>Coordinates: {request.region?.coordinates?.length} points defined</p>
                    {/* You could add a small map preview here */}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {request.status === "pending" && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleRequestUpdate(request._id, "approved")}
                    disabled={updating[request._id]}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{updating[request._id] ? "Approving..." : "Approve"}</span>
                  </button>
                  <button
                    onClick={() => handleRequestUpdate(request._id, "rejected")}
                    disabled={updating[request._id]}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>{updating[request._id] ? "Rejecting..." : "Reject"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No authority requests</h3>
          <p className="mt-1 text-sm text-gray-500">There are no authority registration requests at this time.</p>
        </div>
      )}
    </div>
  )
}

export default AuthorityRequests
