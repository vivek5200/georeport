"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import { Search, Filter, MapPin, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react"

function ReportsList() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Set initial filters from URL params
    const status = searchParams.get("status")
    if (status) {
      setStatusFilter(status)
    }
    fetchReports()
  }, [searchParams])

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (categoryFilter) params.append("category", categoryFilter)

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports?${params.toString()}`)
      setReports(response.data.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [statusFilter, categoryFilter])

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "verified":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">
            {user?.role === "citizen"
              ? "View your reports and nearby issues"
              : user?.role === "authority"
                ? "Manage reports in your area"
                : "System-wide report management"}
          </p>
        </div>
        {user?.role === "citizen" && (
          <Link to="/reports/create" className="btn-primary">
            Create Report
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select className="input-field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="streetlight">Street Light</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("")
              setCategoryFilter("")
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report._id} className="card hover:shadow-lg transition-shadow">
            {/* Report Image */}
            {report.photoUrl && (
              <div className="mb-4">
                <img
                  src={report.photoUrl || "/placeholder.svg?height=200&width=300"}
                  alt={report.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Report Content */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{report.title}</h3>
                <div className="flex items-center space-x-1">{getStatusIcon(report.status)}</div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">{report.description}</p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{report.category}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                    {report.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span>Severity: {report.severity}/5</span>
                </div>
              </div>

              {/* Location and Date */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {report.location?.coordinates
                      ? `${report.location.coordinates[1].toFixed(3)}, ${report.location.coordinates[0].toFixed(3)}`
                      : "Location not available"}
                  </span>
                </div>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Reporter Info (for authorities and admins) */}
              {(user?.role === "authority" || user?.role === "admin") && report.user && (
                <div className="text-xs text-gray-500">Reported by: {report.user.name}</div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex items-center space-x-2">
                  {report.votes !== undefined && <span className="text-xs text-gray-500">Votes: {report.votes}</span>}
                  {report.priorityScore !== undefined && (
                    <span className="text-xs text-gray-500">Priority: {report.priorityScore}</span>
                  )}
                </div>
                <Link
                  to={`/reports/${report._id}`}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter || categoryFilter
              ? "Try adjusting your search criteria"
              : user?.role === "citizen"
                ? "Create your first report to get started"
                : "No reports available"}
          </p>
          {user?.role === "citizen" && !searchTerm && !statusFilter && !categoryFilter && (
            <div className="mt-6">
              <Link to="/reports/create" className="btn-primary">
                Create Report
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportsList
