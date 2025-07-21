"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import MapComponent from "../../components/MapComponent"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle,
} from "lucide-react"

function ReportDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscribeToReport } = useSocket()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusNote, setStatusNote] = useState("")
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  useEffect(() => {
    fetchReport()
    if (id) {
      subscribeToReport(id)
    }
  }, [id])

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/${id}`)
      setReport(response.data.data)
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to load report")
      navigate("/reports")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/reports/${id}/status`, {
        status: newStatus,
        note: statusNote,
      })
      setReport(response.data.data)
      setShowStatusUpdate(false)
      setStatusNote("")
      toast.success(`Report status updated to ${newStatus}`)
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update status"
      toast.error(message)
    } finally {
      setUpdating(false)
    }
  }

  const handleVote = async (value) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reports/${id}/vote`, {
        value,
      })
      setReport(response.data.data)
      toast.success("Vote recorded!")
    } catch (error) {
      const message = error.response?.data?.message || "Failed to vote"
      toast.error(message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verified":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      pending: ["verified", "rejected"],
      verified: ["in_progress", "rejected"],
      in_progress: ["resolved"],
      rejected: [],
      resolved: [],
    }
    return transitions[currentStatus] || []
  }

  const canUpdateStatus = () => {
    return (user?.role === "authority" || user?.role === "admin") && report?.assignedAuthority?._id === user?.id
  }

  const canVote = () => {
    return user?.role === "citizen" && report?.user?._id !== user?.id
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Report not found</h2>
        <button onClick={() => navigate("/reports")} className="mt-4 btn-primary">
          Back to Reports
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/reports")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
              {report.status.replace("_", " ")}
            </span>
            <span className="text-gray-500 text-sm">Report ID: {report._id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Image */}
          {report.photoUrl && (
            <div className="card">
              <img
                src={report.photoUrl || "/placeholder.svg?height=400&width=600"}
                alt={report.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{report.description}</p>
          </div>

          {/* Map */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
            {report.location && (
              <MapComponent center={report.location.coordinates} zoom={15} reports={[report]} height="300px" />
            )}
          </div>

          {/* Status History */}
          {report.history && report.history.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status History</h3>
              <div className="space-y-3">
                {report.history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${getStatusColor(entry.status)}`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{entry.status.replace("_", " ")}</span>
                        <span className="text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Reported by</p>
                  <p className="font-medium">{report.user?.name || "Anonymous"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium capitalize">{report.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <p className="font-medium">{report.severity}/5</p>
                </div>
              </div>

              {report.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-xs">
                      {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              {report.assignedAuthority && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Assigned Authority</p>
                    <p className="font-medium">{report.assignedAuthority.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voting (for citizens) */}
          {canVote() && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Verification</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(1)}
                  className="flex-1 flex items-center justify-center space-x-2 p-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  className="flex-1 flex items-center justify-center space-x-2 p-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Dispute</span>
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">Verification Score: {report.verificationScore || 0}</p>
              </div>
            </div>
          )}

          {/* Status Update (for authorities) */}
          {canUpdateStatus() && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              {!showStatusUpdate ? (
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Update Status</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                    <div className="space-y-2">
                      {getAvailableStatusTransitions(report.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          disabled={updating}
                          className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <span className="capitalize">{status.replace("_", " ")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Add a note about this status change..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowStatusUpdate(false)
                        setStatusNote("")
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Priority Score</span>
                <span className="font-medium">{report.priorityScore || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Votes</span>
                <span className="font-medium">{report.votes || 0}</span>
              </div>
              {report.verificationScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Score</span>
                  <span className="font-medium">{report.verificationScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetails
